import {BookData} from "../service/api.service";
import {ScreenUtil} from "../utils/screen-util";
import {fromEvent, Subject, timer} from "rxjs";
import {takeUntil} from "rxjs/operators";

export class BooksCarousel extends HTMLElement {
  shadow: ShadowRoot;
  bookList: HTMLUListElement;
  observer: IntersectionObserver;
  reInitScroll$: Subject<any>;
  toggleScrollPauseButton: HTMLButtonElement;

  constructor() {
    super();

    this.shadow = this.attachShadow({mode: 'open'});
    this.toggleScrollPauseButton = document.createElement('button');
    this.toggleScrollPauseButton.innerHTML = 'play';

    this.shadow.appendChild(this.toggleScrollPauseButton);

    this.bookList = document.createElement('ul');
    this.shadow.appendChild(this.bookList);

    this.reInitScroll$ = new Subject();

    this.reInitScroll$.subscribe(() => {
      this.toggleScrollPauseButton.innerHTML = 'play';
    });

    fromEvent(window, 'blur').subscribe(() => {
      this.reInitScroll$.next();
    });

    fromEvent(window, 'focus').subscribe(() => {
      this.startScrolling(0);
    });

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

    fromEvent(this.toggleScrollPauseButton, 'click')
      .subscribe(() => {
        // this not very nice but effective

        if (this.toggleScrollPauseButton.innerHTML === 'play') {
          if (this.bookList.innerHTML) {
            this.startScrolling(0);
          }
        } else {
          this.reInitScroll$.next();
        }
      });

    this.styleIt();
  }

  updateList(listOfBooks: BookData[]) {
    this.reInitScroll$.next();
    this.bookList.innerHTML = '';

    listOfBooks.forEach((elemData: BookData) => {
      const bookItem = document.createElement('li');
      bookItem.innerHTML = `
        <h2>${elemData.title}</h2>
        <h3>${elemData.author} ${elemData.firstPublishedDate}</h3>
        <img data-src="http://covers.openlibrary.org/b/isbn/${elemData.isbn}-${ScreenUtil.getKey(window.screen.availWidth)}.jpg">
      `;
      this.bookList.appendChild(bookItem);
      this.observer.observe(bookItem);
    });

    window.scrollTo(0, 0);

    if (this.bookList.innerHTML) {
      this.startScrolling();
    }
  }

  private startScrolling(startIn = 5000) {
    timer(startIn, 1000)
      .pipe(
        takeUntil(this.reInitScroll$)
      ).subscribe(() => {
      this.toggleScrollPauseButton.innerHTML = 'pause';
      window.scrollBy({left: 0, top: window.screen.availHeight / 2, behavior: 'smooth'});
    });
  }

  private preloadImage(listItem: HTMLLIElement) {
    const img = listItem.querySelector('img');
    img.src = img.getAttribute('data-src');
  };

  private styleIt() {
    const style = document.createElement('style');
    this.shadowRoot.appendChild(style);

    style.textContent = `
      button {
        position: fixed;
        top: 1%;
        right: 1%;
      }
      li {
        list-style-type: none;
        margin-bottom: 24px;
      }`;
  }
}