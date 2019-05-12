import {from, Observable} from "rxjs";
import {config} from "../utils/config";

export interface BookData {
  title: string;
  isbn: string;
  author: string;
  firstPublishedDate: Date;
}

export type SearchBy = 'title' | 'author';

export class SearchService {
  constructor() {
  }

  search(searchBy: SearchBy, key: string): Observable<Array<BookData>> {
    const uri = `${config.API_URL}?${searchBy}=${key}`;
    const apiCall = fetch(uri)
      .then(response => response.json())
      .then(responseJson => ((responseJson || {}).docs || []).map((rawItem: any) => {
        const bookData: BookData = {
          author: (rawItem.author_name || [])[0],
          title: rawItem.title_suggest,
          firstPublishedDate: rawItem.first_publish_year,
          isbn: (rawItem.isbn || [])[0]
        };

        return bookData;
      }));
    return from(apiCall);
  }
}