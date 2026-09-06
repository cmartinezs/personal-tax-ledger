export type LocalTaxProfile = {
  displayName: string;
  taxId: string;
  taxResidenceCountry: string;
  taxpayerMode: 'DEPENDENT' | 'INDEPENDENT' | 'MIXED';
  preferredTaxYear: number;
  defaultAfpName: string;
  defaultHealthSystem: 'FONASA' | 'ISAPRE' | 'NONE' | '';
  defaultApvRegime: 'NONE' | 'A' | 'B';
  notes: string;
};

export type WorkspaceConfig = {
  name: string;
  path: string;
};

export type WorkspaceStatus = {
  path: string;
  databasePath: string;
  hasDatabase: boolean;
};

export type DesktopBootstrapConfig = {
  schemaVersion: number;
  firstRunCompleted: boolean;
  lastSeenVersion: string | null;
  profile: LocalTaxProfile;
  activeWorkspace: WorkspaceConfig;
  pendingWorkspace: { workspace: WorkspaceConfig; mode: WorkspaceMode } | null;
  appVersion: string;
  launchKind: 'FIRST_RUN' | 'UPDATED' | 'NORMAL';
  activeWorkspaceStatus: WorkspaceStatus;
};

export type WorkspaceMode = 'OPEN_EXISTING' | 'ADOPT_CURRENT' | 'CREATE_NEW';

export type DesktopBootstrapUpdate = {
  profile?: Partial<LocalTaxProfile>;
  firstRunCompleted?: boolean;
  lastSeenVersion?: string | null;
  workspace?: WorkspaceConfig;
  workspaceMode?: WorkspaceMode;
};

export interface PtlDesktopBridge {
  getBootstrapConfig(): Promise<DesktopBootstrapConfig>;
  updateBootstrapConfig(payload: DesktopBootstrapUpdate): Promise<DesktopBootstrapConfig & { restartRequired: boolean }>;
  chooseWorkspace(): Promise<WorkspaceStatus | null>;
  inspectWorkspace(path: string): Promise<WorkspaceStatus | null>;
  restart(): Promise<void>;
}

export function desktopBridge(): PtlDesktopBridge | null {
  return window.ptlDesktop ?? null;
}
