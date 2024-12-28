1. save snapshot/restore -> jesli chcesz zapisac zmiany bo cos zaraz bedziesz robic i nie bedziesz wiedzial czy chcesz to zachowac to by potem szybko przywrocic mape do stanu z save

2. nieskonczona mapa pomysl 1: jesli zaczniemy od chunka w srodku jako chunk 0 to mozemy uzyc przejscia clockwise by obliczyc chunki dookoła:
   [4,3,2]
   [5,0,1]
   [6,7,8]
   dzieki temu nie musimy faktycznie dodawac chunkow w grid a znajac obecny chunk mozemy obliczyc wszystkie chunki dookola jego czy one istnieja czy nie:

[17,16,15,14,13]
[18,05,04,03,12]
[19,06,01,02,11]
[20,07,08,09,10]
[21,22,23,24,25]
zaden chunk nie musi istniec bys wiedzial ze do okoloa 9 jest -> 10,11,2,1,8,23,24,25:
[--,--,--,--,--]
[18,05,04,--,--]
[--,06,01,--,--]
[--,--,08,09,10]
[21,22,23,24,25]
chcac wczytac chunki dookoła 4 dalej dokładnie wiesz jakie to sa indexy
