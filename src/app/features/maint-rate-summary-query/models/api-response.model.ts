import { Root } from './root.model';
import { SummaryDetail } from './summary-detail.model';

export interface ApiResponse {
  details: SummaryDetail[];
  root: Root[];
}
