import config from 'app/core/config';

import coreModule from 'app/core/core_module';
import { PanelContainer } from './dashgrid/PanelContainer';
import { DashboardModel } from './dashboard_model';
import { PanelModel } from './panel_model';

export class DashboardCtrl implements PanelContainer {
  dashboard: DashboardModel;
  dashboardViewState: any;
  loadedFallbackDashboard: boolean;
  editTab: number;

  /** @ngInject */
  constructor(
    private $scope,
    private $rootScope,
    private keybindingSrv,
    private timeSrv,
    private variableSrv,
    private alertingSrv,
    private dashboardSrv,
    private unsavedChangesSrv,
    private dashboardViewStateSrv,
    public playlistSrv,
    private panelLoader
  ) {
    // temp hack due to way dashboards are loaded
    // can't use controllerAs on route yet
    $scope.ctrl = this;

    // TODO: break out settings view to separate view & controller
    this.editTab = 0;

    // funcs called from React component bindings and needs this binding
    this.getPanelContainer = this.getPanelContainer.bind(this);
  }

  setupDashboard(data) {
    try {
      this.setupDashboardInternal(data);
    } catch (err) {
      this.onInitFailed(err, '仪表盘初始化失败', true);
    }
  }

  setupDashboardInternal(data) {
    const dashboard = this.dashboardSrv.create(data.dashboard, data.meta);
    this.dashboardSrv.setCurrent(dashboard);

    // init services
    this.timeSrv.init(dashboard);
    this.alertingSrv.init(dashboard, data.alerts);

    // template values service needs to initialize completely before
    // the rest of the dashboard can load
    this.variableSrv
      .init(dashboard)
      // template values failes are non fatal
      .catch(this.onInitFailed.bind(this, '模板初始化失败', false))
      // continue
      .finally(() => {
        this.dashboard = dashboard;
        this.dashboard.processRepeats();
        this.dashboard.updateSubmenuVisibility();
        this.dashboard.autoFitPanels(window.innerHeight);

        this.unsavedChangesSrv.init(dashboard, this.$scope);

        // TODO refactor ViewStateSrv
        this.$scope.dashboard = dashboard;
        this.dashboardViewState = this.dashboardViewStateSrv.create(this.$scope);

        this.keybindingSrv.setupDashboardBindings(this.$scope, dashboard);
        this.setWindowTitleAndTheme();

        this.$scope.appEvent('dashboard-initialized', dashboard);
      })
      .catch(this.onInitFailed.bind(this, '仪表盘初始化失败', true));
  }

  onInitFailed(msg, fatal, err) {
    console.log(msg, err);

    if (err.data && err.data.message) {
      err.message = err.data.message;
    } else if (!err.message) {
      err = { message: err.toString() };
    }

    this.$scope.appEvent('alert-error', [msg, err.message]);

    // protect against  recursive fallbacks
    if (fatal && !this.loadedFallbackDashboard) {
      this.loadedFallbackDashboard = true;
      this.setupDashboard({ dashboard: { title: '仪表盘初始化失败' } });
    }
  }

  templateVariableUpdated() {
    this.dashboard.processRepeats();
  }

  setWindowTitleAndTheme() {
    window.document.title = config.windowTitlePrefix + this.dashboard.title;
  }

  showJsonEditor(evt, options) {
    const editScope = this.$rootScope.$new();
    editScope.object = options.object;
    editScope.updateHandler = options.updateHandler;
    this.$scope.appEvent('show-dash-editor', {
      src: 'public/app/partials/edit_json.html',
      scope: editScope,
    });
  }

  getDashboard() {
    return this.dashboard;
  }

  getPanelLoader() {
    return this.panelLoader;
  }

  timezoneChanged() {
    this.$rootScope.$broadcast('refresh');
  }

  getPanelContainer() {
    return this;
  }

  onRemovingPanel(evt, options) {
    options = options || {};
    if (!options.panelId) {
      return;
    }

    const panelInfo = this.dashboard.getPanelInfoById(options.panelId);
    this.removePanel(panelInfo.panel, true);
  }

  removePanel(panel: PanelModel, ask: boolean) {
    // confirm deletion
    if (ask !== false) {
      let text2, confirmText;

      if (panel.alert) {
        text2 = '面板包含报警规则，删除面板也将删除报警规则';
        confirmText = '确认';
      }

      this.$scope.appEvent('confirm-modal', {
        title: '删除面板',
        text: '确定要删除此面板吗?',
        text2: text2,
        icon: 'fa-trash',
        confirmText: confirmText,
        yesText: '删除',
        onConfirm: () => {
          this.removePanel(panel, false);
        },
      });
      return;
    }

    this.dashboard.removePanel(panel);
  }

  init(dashboard) {
    this.$scope.onAppEvent('show-json-editor', this.showJsonEditor.bind(this));
    this.$scope.onAppEvent('template-variable-value-updated', this.templateVariableUpdated.bind(this));
    this.$scope.onAppEvent('panel-remove', this.onRemovingPanel.bind(this));
    this.setupDashboard(dashboard);
  }
}

coreModule.controller('DashboardCtrl', DashboardCtrl);
