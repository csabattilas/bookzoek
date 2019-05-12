import {VoiceSearchBar} from "./elements/voice-search-bar";
import {BooksCarousel} from "./elements/books-carousel";

customElements.define('voice-search-bar', VoiceSearchBar);
customElements.define('books-carousel', BooksCarousel);

window['addN'] = (n: number) => (m: number) => n + m;

document.querySelector('voice-search-bar')
  .addEventListener('result', (event: CustomEvent) => {
    const booksCarousel: BooksCarousel = document.querySelector('books-carousel');

    booksCarousel.updateList(event.detail);
  });
