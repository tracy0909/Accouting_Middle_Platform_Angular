import { DivamtDetail } from './divamt-detail.model';
import { Root } from './root.model';

export interface ApiResponse {
  details: DivamtDetail[];
  root: Root[];
}
