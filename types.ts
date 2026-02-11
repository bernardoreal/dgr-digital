
export type ContentType = 'paragraph' | 'list' | 'table' | 'note' | 'warning' | 'figure' | 'packing-instruction' | 'variation' | 'definition-list' | 'visual-mark' | 'checklist' | 'tool' | 'wizard' | 'database';

export interface DGRTable {
  headers: string[];
  rows: (string | boolean)[][]; 
  caption?: string;
  type?: 'standard' | 'matrix'; 
  colWidths?: string[]; 
  footnotes?: string[];
}

export interface DGRDatabase {
  id: string;
  title: string;
  type: 'blue-pages' | 'variations' | 'glossary';
  columns: { key: string; label: string; width?: string; filterable?: boolean }[];
  data: Record<string, any>[];
}

export interface DGRList {
  items: string[];
  ordered: boolean;
  type?: 'alpha' | 'numeric' | 'bullet';
}

export interface DGRDefinition {
  term: string;
  definition: string;
}

export interface DGRNote {
  title?: string;
  text: string;
}

export interface DGRFigure {
  type: 'label';
  labelClass: string; 
  caption: string;
}

export interface DGRMark {
  type: 'lq' | 'lq-y' | 'eq' | 'lithium-battery' | 'orientation' | 'cargo-only' | 'cryogenic' | 'keep-away-heat' | 'mag' | 'radioactive-i' | 'radioactive-ii' | 'radioactive-iii';
  data?: {
    class?: string; // For EQ
    unNumbers?: string; // For Battery Mark
    phone?: string; // For Battery Mark
  };
  caption: string;
}

export interface DGRVariation {
  code: string; // e.g., "USG-01"
  owner: string; // e.g., "United States"
  text: string;
}

export interface DGRChecklist {
    id: string;
    title: string;
    items: {
        id: string;
        text: string;
        reference?: string;
    }[];
}

export type DGRToolType = 'segregation-checker';

export interface DGRTool {
    toolType: DGRToolType;
    title: string;
    data: {
        classes: string[];
        labels: Record<string, string>; // "3": "Líquido Inflamável"
        matrix: Record<string, Record<string, boolean>>; // true = OK, false = Segregate
        notes: Record<string, string>;
    };
}

export interface DGRWizard {
  id: string;
  title: string;
  startNodeId: string;
  nodes: Record<string, {
    question: string;
    options: { label: string; nextNodeId: string }[];
  }>;
  results: Record<string, {
    title: string;
    description: string;
    type: 'success' | 'warning' | 'danger';
    actionText?: string;
  }>;
}

export interface DGRPackingInstruction {
  id: string; 
  title: string;
  transportMode: 'Passenger and Cargo' | 'Cargo Aircraft Only';
  content: DGRContentBlock[];
}

export interface DGRContentBlock {
  type: ContentType;
  content: string | string[] | DGRTable | DGRList | DGRNote | DGRFigure | DGRPackingInstruction | DGRVariation | DGRDefinition[] | DGRMark | DGRChecklist | DGRTool | DGRWizard | DGRDatabase;
}

export interface DGRSection {
  id: string;
  title: string;
  blocks: DGRContentBlock[]; 
  subsections?: DGRSection[];
}

export interface DGRChapter {
  id: number | string; 
  title: string;
  description: string;
  color: string;
  sections: DGRSection[];
  icon?: any;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CHAPTER_DETAIL = 'CHAPTER_DETAIL',
  COMPLIANCE_ADMIN = 'COMPLIANCE_ADMIN'
}

export interface SearchResult {
  chapterId: number | string;
  sectionId: string;
  text: string;
  relevance: number;
}

// --- Data Governance Types ---

export type DataSourceType = 'SIMULATION' | 'OFFICIAL_API' | 'MANUAL_OVERRIDE';
export type ValidationStatus = 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED_OPERATIONAL';

export interface RegulatoryConfig {
    edition: string;
    effectiveDate: string;
    dataSource: DataSourceType;
    validationStatus: ValidationStatus;
    lastSync: string;
    activeVariationsCount: number;
}
