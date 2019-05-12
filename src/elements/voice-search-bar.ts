import {fromEvent} from "rxjs";
import {filter, mergeMap, switchMap} from "rxjs/operators";
import {SearchService} from "../service/api.service";

export class VoiceSearchBar extends HTMLElement {
  shadow: ShadowRoot;
  recognition: any;
  voiceOn = false;

  constructor() {
    super();

    this.shadow = this.attachShadow({mode: 'open'})
    this.recognition = new (window as any).webkitSpeechRecognition();
    this.recognition.lang = 'EN';

    this.init();
  }

  private init() {
    const input = document.createElement('input');

    const voiceToggle = document.createElement('button');
    voiceToggle.innerHTML = 'voice on';

    const goSearch = document.createElement('button');
    goSearch.innerHTML = "search";

    this.shadow.appendChild(input);
    this.shadow.appendChild(voiceToggle);
    this.shadow.appendChild(goSearch);

    const searchClick$ = fromEvent(goSearch, 'click');
    const searchKeyUp$ = fromEvent(input, 'keyup');
    const searchService = new SearchService();

    const voiceToggle$ = fromEvent(voiceToggle, 'click');

    searchKeyUp$.pipe(
      filter((e: KeyboardEvent) => e.code === '13'),
      // mergeMap(() => searchClick$),
      switchMap(() => searchService.search('title', input.value))
    ).subscribe((data) => {
      const resultEvent = new CustomEvent("result", {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: data
      });

      this.dispatchEvent(resultEvent);
    });

    voiceToggle$
      .subscribe(data => {
        this.voiceOn = !this.voiceOn;

        if (this.voiceOn) {
          voiceToggle.innerHTML = 'voice off';
          this.recognition.start();
        } else {
          voiceToggle.innerHTML = 'voice on';
          this.recognition.stop();
        }
    });

    this.recognition.onresult = (recognitionResultEvent: any) => {
      for (let i = recognitionResultEvent.resultIndex; i < recognitionResultEvent.results.length; ++i) {
        if (recognitionResultEvent.results[i].isFinal) {
          input.value = recognitionResultEvent.results[i][0].transcript;
        } else {
          input.value += recognitionResultEvent.results[i][0].transcript;
        }
      }

      this.voiceOn = false;
      voiceToggle.innerHTML = 'voice on';
      this.recognition.stop();
    }
  }
}