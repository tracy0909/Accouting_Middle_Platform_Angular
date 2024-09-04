import { BhnoList } from './bhno-list.model';

export interface QueryList {
  QUERY_list: {
    BhNoCount: string;
    DB_list: {
      DBIp: string;
      DBName: string;
      BHNO_list: BhnoList[];
    };
  };
}
