import {BookData} from "../service/api.service";
import {ScreenUtil} from "../utils/screen-util";
import {Subject, timer} from "rxjs";
import {takeUntil} from "rxjs/operators";

export class BooksCarousel extends HTMLElement {
  shadow: ShadowRoot;
  bookList: HTMLUListElement;
  observer: IntersectionObserver;
  reInitScroll$: Subject<any>;

  constructor() {
    super();

    this.shadow = this.attachShadow({mode: 'open'})
    this.bookList = document.createElement('ul');
    this.shadow.appendChild(this.bookList);
    this.reInitScroll$ = new Subject();

    this.observer = new IntersectionObserver((entries, self) => {

      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.preloadImage(entry.target as HTMLLIElement);
          self.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px ' + window.screen.availHeight / 2 + 'px  0px',
      threshold: 0
    });
  }

  updateList(listOfBooks: BookData[]) {
    this.reInitScroll$.next();
    this.bookList.innerHTML = '';

    listOfBooks.forEach((elemData: BookData, index) => {
      const bookItem = document.createElement('li');
      bookItem.innerHTML = `
        <h2>${elemData.title}</h2>
        <h3>${elemData.author} ${elemData.firstPublishedDate}</h3>
        <img data-src="http://covers.openlibrary.org/b/isbn/${elemData.isbn}-${ScreenUtil.getKey(window.screen.availWidth)}.jpg">
      `;
      this.bookList.appendChild(bookItem);
      this.observer.observe(bookItem);
    });

    window.scrollTo(0,0);

    timer(5000, 1000)
      .pipe(
        takeUntil(this.reInitScroll$)
      ).subscribe(() => {
      window.scrollBy({left: 0, top: window.screen.availHeight / 2, behavior: 'smooth'});
    });
  }

  private preloadImage(listItem: HTMLLIElement) {
    const img = listItem.querySelector('img');
    img.src = img.getAttribute('data-src');
  };
}