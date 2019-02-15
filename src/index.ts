import { from, fromEvent, Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';

interface IGithubUrl {
  name: string;
  html_url: string;
}

interface IGithubResponse {
  items: IGithubUrl[];
}

const searchInput: HTMLInputElement = document.querySelector('#search') as HTMLInputElement;
const resultElement: HTMLUListElement = document.querySelector('#result') as HTMLUListElement;

const sequence$: Observable<Event> = fromEvent(searchInput, 'input');

const sequence1$: Observable<IGithubUrl> = sequence$.pipe(
    debounceTime(300),
    map((event: Event): string => {
        return (event.target as HTMLInputElement).value;
    }),
    filter((value: string) => value !== ''),
    distinctUntilChanged(),
    switchMap((value: string): Observable<IGithubUrl[]> => {
        return from(
            fetch(`https://api.github.com/search/repositories?q=${value}`)
                .then((response: Response): object => response.json())
                .then((response: IGithubResponse): IGithubUrl[] => response.items)
        ).pipe(
            map((items: IGithubUrl[]) => items.length ? items : []),
            catchError(() => {
                return of([]);
            })
        );
    }),
    switchMap((items: IGithubUrl[]): Observable<IGithubUrl|null> => {
        return from(items).pipe(
            map((item: IGithubUrl) => item),
            catchError(() => {
                return of(null);
            })
        );
    })
);

sequence$.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((_event: Event) => {
    resultElement.innerText = '';
});

sequence1$.subscribe((item: IGithubUrl|null) => {
    if (!item) {
        return;
    }
    const li: HTMLLIElement = document.createElement('li');
    li.innerHTML = `<a href=${item.html_url} target="_blank">${item.name}</a>`;
    resultElement.appendChild(li);
});
