import {from, fromEvent, Observable, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, switchMap} from 'rxjs/operators';

interface IGithubUrl {
  name: string;
  html_url: string;
}

interface IGithubResponse {
  items: IGithubUrl[];
}

const searchInput: HTMLInputElement = document.querySelector('#search') as HTMLInputElement;

const sequence$: Observable<Event> = fromEvent(searchInput, 'input');

const sequence1$: Observable<IGithubUrl[]> = sequence$.pipe(
    debounceTime(300),
    map((event: Event): string => {
        return (event.target as HTMLInputElement).value;
    }),
    distinctUntilChanged(),
    switchMap((value: string): any => {

        return from(
            fetch(`https://api.github.com/search/repositories?q=${value}`)
                .then((response: Response): object => response.json())
                .then((response: IGithubResponse): IGithubUrl[] => response.items)
        ).pipe(
            catchError(() => {
                return of([]);
            })
        );

    }),
    switchMap((items: IGithubUrl[]): IGithubUrl => {
        return from(items).pipe(
            catchError(() => {
                return of([]);
            })
        );
    })
);

sequence1$.subscribe((value: IGithubUrl) => {
    console.log(value);
});
