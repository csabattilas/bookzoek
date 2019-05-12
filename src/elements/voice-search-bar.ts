import {fromEvent, Subject, merge, timer} from "rxjs";
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap, takeUntil,
  tap
} from "rxjs/operators";
import {SearchService} from "../service/api.service";

export class VoiceSearchBar extends HTMLElement {
  shadow: ShadowRoot;
  voiceToggle: HTMLButtonElement;
  searchButton: HTMLButtonElement;
  loader: HTMLDivElement;
  relTime: any;
  secondsAgo = 0;

  recognition: any;
  voiceOn = false;

  constructor() {
    super();

    this.shadow = this.attachShadow({mode: 'open'})

    this.recognition = new (window as any).webkitSpeechRecognition();
    this.recognition.lang = 'EN';

    this.relTime = new (Intl as any).RelativeTimeFormat(navigator.language);

    this.init();
  }

  private init() {
    const recognitionSubject$ = new Subject();
    const reInitTimer$ = new Subject();
    const searchService = new SearchService();

    const input = document.createElement('input');

    this.voiceToggle = document.createElement('button');
    this.voiceToggle.innerHTML = 'voice on';

    this.searchButton = document.createElement('button');
    this.searchButton.innerHTML = "search";

    this.loader = document.createElement('div');
    this.loader.innerHTML = 'loading books...';
    this.loader.style.display = 'none';

    const relTimeSpan = document.createElement('span');

    this.shadow.appendChild(input);
    this.shadow.appendChild(this.voiceToggle);
    this.shadow.appendChild(this.searchButton);
    this.shadow.appendChild(relTimeSpan);
    this.shadow.appendChild(this.loader);

    const clickSubject$ = fromEvent(this.searchButton, 'click')
      .pipe(
        map(() => input.value));

    const inputKeyUp$ = fromEvent(input, 'keyup')
      .pipe(
        filter((e: KeyboardEvent) => e.code === 'Enter'),
        map((event: KeyboardEvent) => (event.target as HTMLInputElement).value),
        distinctUntilChanged());

    const voiceToggle$ = fromEvent(this.voiceToggle, 'click')

    this.recognition.onresult = (recognitionResultEvent: any) => {
      input.value = recognitionResultEvent.results[0][0].transcript;

      this.voiceOff();

      recognitionSubject$.next(input.value);
    };

    merge(clickSubject$, inputKeyUp$, recognitionSubject$).pipe(
      tap(() => {
        this.loader.style.display = 'block';
        reInitTimer$.next();
      }),
      switchMap((data: any) => {
        return searchService.search('title', data)
      })
    ).subscribe((data) => {
      const resultEvent = new CustomEvent("result", {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: data
      });

      this.searchButton.disabled = false;
      this.loader.style.display = 'none';

      this.dispatchEvent(resultEvent);

      this.secondsAgo = 0;

      timer(1000, 1000)
        .pipe(
          takeUntil(reInitTimer$)
        )
        .subscribe(() => {
          this.secondsAgo++;
          relTimeSpan.innerHTML = this.relTime.format(-this.secondsAgo, 'second');
      })

    });

    voiceToggle$
      .subscribe(() => {
        this.voiceOn = !this.voiceOn;

        if (this.voiceOn) {
          this.voiceToggle.innerHTML = 'voice off';
          this.searchButton.disabled = true;
          this.recognition.start();
        } else {
          this.voiceOff();
        }
      });
  }

  private voiceOff() {
    this.voiceToggle.innerHTML = 'voice on';
    this.searchButton.disabled = false;
    this.recognition.stop();
  }
}