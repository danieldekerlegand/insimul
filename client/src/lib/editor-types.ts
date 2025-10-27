export type SystemType = 'ensemble' | 'kismet' | 'tott' | 'insimul';

export interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  systemType?: SystemType;
  isOpen?: boolean;
  children?: FileTreeNode[];
}

export interface EditorTab {
  id: string;
  name: string;
  type: 'file' | 'character' | 'genealogy' | 'simulation';
  content?: string;
  isDirty?: boolean;
  systemType?: SystemType;
}

export interface RuleValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface SystemStatus {
  name: string;
  type: SystemType;
  status: 'connected' | 'disconnected' | 'error';
  rulesCount?: number;
  details?: Record<string, any>;
}

export interface ConsoleMessage {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  source?: string;
}
