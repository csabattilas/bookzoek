import {BookData} from "../service/api.service";
import {ScreenUtil} from "../utils/screen-util";
import {timer} from "rxjs";

export class BooksCarousel extends HTMLElement {
  shadow: ShadowRoot;
  bookList: HTMLUListElement;
  observer: IntersectionObserver;

  static readonly scrollConfig = {
    rootMargin: '0px 0px 50px 0px',
    threshold: 0
  };

  constructor() {
    super();

    this.shadow = this.attachShadow({mode: 'open'})
    this.bookList = document.createElement('ul');
    this.shadow.appendChild(this.bookList);

    this.observer = new IntersectionObserver((entries, self) => {

      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.preloadImage(entry.target as HTMLLIElement);
          self.unobserve(entry.target);
        }
      });
    }, BooksCarousel.scrollConfig);
  }

  updateList(listOfBooks: BookData[]) {
    console.log(name);
    // load the first 4 element
    // scroll based on data

    this.bookList.innerHTML = '';

    listOfBooks.forEach((elemData: BookData) => {
      const bookItem = document.createElement('li');
      bookItem.innerHTML = `
        <h2>${elemData.title}</h2>
        <h3>${elemData.author} ${elemData.firstPublishedDate}</h3>
        <img data-src="http://covers.openlibrary.org/b/isbn/${elemData.isbn}-${ScreenUtil.getKey(window.screen.availWidth)}.jpg">
      `;
      this.observer.observe(bookItem);

      this.bookList.appendChild(bookItem);
    });

    timer(5000, 1000).subscribe(() => {
      window.scrollBy({left: 0, top: 100, behavior: 'smooth'});
    });
  }

  private preloadImage(listItem: HTMLLIElement) {
    const img = listItem.querySelector('img');
    img.src = img.getAttribute('data-src');
  };
}