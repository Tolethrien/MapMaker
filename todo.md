# bugs

- jak wczytujesz projekt to canvas przestaje miec zakrzywiane rogi
- spinner wczytywania blokuje sie na inicjacji silnika, cos tam jest nie asyncowe
- pomniejszanie textury w textureView ma ikone + zamiast -
- jak zamykasz texture czy tileView to obiekty sie nie czyszczą
- struct w objectView ma zamiast collidera i anchora ikone trash
- w chunk.json jest zapisywany jako {} zamiast []
- jak dodajesz cos powiedzmy na 3 layer, ale nie ma layer 1,2 to zrobia sie null w chunk.json
- jak wyjedziesz kamera poza teren wczytanych hollowow to sie nie doczytuja jak zmienisz na grid(wyswietl hollowy), powinno wtedy spradzac gdzie jestes i doczytywac hollowy z tego miejsca
- klikniecie pusta myszka w tile
- zwiniecie/rozwiniecie tilemap zakladki w textureVIew wylacza canvas
- zjebal sie wyglad paska alpha w tile/struct VIew

# think

- moze da sie jakos sprawdzac na ktorym jest myszka chunku, bez potrzeby loopowania przez chunki a matematycznie jak tile(dzieje sie w kilku miejscach)
- co zrobic na nakładaniu sie obiektow? zabronic dodania czy usunac tamten
- cache renderu - po 1 wyrendrowaniu np ziemi, chunk moglby trzymac wyrenderowany caly chunk jako jedna grafike i wyswietlac to, to samo obiekty, a przerenderowywane by bylo tylko podczas zmiany
- czy nie lepiej przejsc na jakis ECS system, miec wszystkie tile w jednej liscie i po prostu latwiej bedzie miec wszystkie inputy bo masz grid zwykly tilow

# refactor

ui

- views (one layer, collider )
- brush selectors
- paski visibility
- paski layerow
- actions (dodaj chunk,klik w tile by zobaczyc liste itp)

## sterowanie

- w trybie draw lewy myszy brushuje, prawy myszy robi krztałty
- w trybie gumki to co wyzej ale usuwanie
- chciałbym miec mozliwosc widziec 1 layer
- menu dodawania chunkow
- mozliwosc podnoszenia/opuszczania z po polozeniu juz kafla
- mozliwosc przesuniecia calego layers na inne miejsce(chcesz przesunac beczke i cale ozdoby na niej)
- przezroczystosc na kazdym layerze
- rysowanie normalne lub randomem

## czy ja dalej chce?

- focus chunk

## co nie dziala

- single layer view
- nazywanie view

# changes

- refactor chunk i tile bo teraz to renderowanie i robienie colliderow jest dziwne i za duzo tego, domyslnie bym chcial by chunk i tile tylko trymały ane a to sie obliczalo wszystko w EM
- placeObject musi nadpisywac w pliku wszystkie chunki na ktorych cos polozyl a nie tylko jeden jak tile
- EM odpowiada za renderowanie przezroczystego obiektu na tilu na ktorym jest myszka
- odśmiecic rozne formaty, np uzywasz i vectorow i box2d mimo iz moglby byc vec4 i miec contain w sobie itp...
- pozamieniaj duza ilosc return na Errory czy asercje
- collidery i anchory powinny byc usuwane ze structu kiedy zmieniasz rozmiar jego, i collider albo anchor sie nie miesci
- zmien modal/dialog na zwyklego diva na srodku i zrob jednego generalnego i wypelniaj go danymi
- tileset oraz objectset sie nie resetuja po zamknieciu komponentu, dalej jest lista obiektow stworzona np.
- zrob jeden stan error/succes zamiast miec 2 osobne zmienne na to w asyncu

# TODO

- zrobic mozliwosc usuwania structu po kliku w obiekt. Obecnie by usunac rzeba kliknac w anchor
- zmienic nazwe tile (tile/struct) booo masz tile i potem tile layer i to sie miesza potem w nazwach
- objectList mialo wyswietlac zdjecie obiektu
- tryb rysownia colliderow
- chce widziec tile ktory targetuje/chce widziec w przypadku obiektow co zostanie usunięte jak to tu położę
- jak zmieniasz w objectView selector z np path na collider to zmieniaj tez kolejnosc rysowania by dalo sie widziec te linie a nie zawsze linie Path
- dodaj opcje zaznaczania wiecej niz jedengo tila, rysownaia calymi płatami - zmiana w mouseManifold
- lepszy PackShelf oraz przy okazji tworzenie img w AM z canvasu packShelfa (generateViewImage)
- przelec wszystkie bubblowanie if!succes return bo pewnie polowa nie idzie nigdzie
- jak chcesz widziec singleLayer to musisz miec wybor czy jestes w trybie tile czy struct
- dodac by dalo sie zaznaczac structy na canvasie za pmoca selectora select
- w structView zrobic ze nie mozna zrobic obiektu ktory nie ma anchor
- sprawdzac czy nie tworze 2 tych samych view dajac po prostu 2 te same textury bez zmian w danych ich
- resize canvasu nazmianie wielkosci okna
- minimap module
- mozliwosci wybierania modulow na ekranie
- moduły musza miec mozliwosc zamkniecia ich z paska bocznego oraz settingi(masz ikonki na nich)
- ObjectSet moze miec alphe na kazdy selector a nie jedna genralna dla wszystkich, by lepiej bylo widac collidery i anchory
- kiedy tworzac obiekty zmianiasz rozmiar tilesizu czy texture powinienes dostac jakis komunikat ze wszystko zostnaie wyczyszczone
- hover na liste obiektow po boku w objectSet powienien jakos podswietlac element na canvasie
- w tileSet dodaj jakies info ze textura wczytana jest wieksza niz rownowartosc gridu a to zostawi klikalne resztki
- draw with randomTile
- tileSetView pozwala ci miec included ale nic sie z tym nie dzieje, to nie dziala - nie dodaje ich jedynie do LUT

# DONE

x usuwanie nie dziala na innym niz poziom 0 w struct, a w tile usuwa wszystkie bo nie filtruje
x mouseEventy
x usuwanie z mapy
x tile addLayers powinno sortowac layery a nie dodawac na konkretny index, jesli to zrobisz usun w statycznej ze jak jest null to return bo nie bedzie juz null
x zmien ikone z-indexSVG (selector) bo gownianie wyglada
x w structure trzymaj tylko included tiles jako set a potem jak sprawdzasz collider to set ma opcje czy set jest czescia innego setu, jak tak to git, rysowanie tez mozesz matematycznie z flor wyciagac jak to robisz w mouseEvencie
x zIndex ma od teraz zapamietane 2 wartosci dla tile/ob
x z-index
x layer alpha
x stworz w asset managerze po prostu funkcje createView w ktorej podasz wszystkie dane z objsetSetView i sie zrobi... zamiast 3 rozne funkcje w 3 miejscach
x na nowo cale usuwanie wszystkiego bo teraz inaczej zupelnie jest data flow
x usuwanie texture/view
x postaraj sie zrobic jakos moze jeden canvas do kontroli objectView i TileVIew?
x utilsy dla canvasa bo czesto uzywam tego samego
x na nowo ogarnianie myszka bo teraz jest wszystko na klik znowua nie drag
x znajdz wszystkie instancje slowa object i zamien na structure czy jakkolwiek to bedzie sie nazywac
x pliki do zmiany:
x eventy myszki
x zmien nazwe object np plikow no bo sama tresc to struktury
x chunk view
x zmien structure bo to przesadzona nipotrzebnie zbloatowana funkcja
x w textureView zoomowanie textury (+/- button)
x zrob by ustawianie chunka i tila nie bylo co kazdy mouseMove a jakos mniej, np co frame na bazie ruchu myszki bo to wykonuje bardzo duzo obliczen mimo iz jest wygodne
x przypisz jeden canvas referencje wszedie a nie przekazuj ciagle go do funkcji
x textureView nie odświeża listy textur jak dodajesz nową -> to zrobic wraz z nowym createView w refaktorze
x nie dziala czyszczenie danych jak robisz load project kiedy masz zaladowany inny
x entity nie uzywa juz collide bo nie ma juz eventu myszki na tile
x mouseEvent teraz dzieje sie w EM (potencjalnie moze w input managerze?)
x zmiana shadera do rysowania od left top
x zmiana w tile i chunk pozycjonowania bo shader
x Math dla box2d jak collider,cross itp
x EM ma teraz globalny struct na jakim [chunk,tile] jest myszka
x wywal rotacje z entity
x zmienic w Tile .tileIndex na samo index
x objectCreator teraz nie musi juz outputowac polowy rzecz, wystarczy crop,pozycja na canva,anchorTile,colliderTiles
x zapis na dysku jak wyżej
x liczenie offsetow powinno w sumie byc dodawane do LUT boo to jest ten sam offset dla kazdego kafla, po co to liczyc wiecznie
x dekoratywy trzymaja indexy w pozycji w LUcie i na bazie tego mozesz ocenic ktore bloki ddokola sa czescia tez tego obiektu
x zrobic w pelni dzialajacy input handler
x naprawiono roznice miedzy layer a z-index, wczesniej to bylo to samo
x mouse wheel w tileset canvas rusza mapa i tworzy AABB przy okazji
x w dodawaniu tilesetu opacity gridu jest zle na start
