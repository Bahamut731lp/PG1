# 2. úkol (studio)
Cílem tohoto úkolu je využít zkušenosti z předchozích cvičení k sestavení scény z několika obrázků.

## Úkol:

1. Vytvořte webovou stránku v souboru `index.html` pomocí jazyka __HTML5__, který bude bude obsahovat 4 elementy `<canvas></canvas>`.
    - Do prvního canvasu se nahraje popředí scény
    - Do druhého canvasu se nahraje pozadí scény
    - Do třetího canvasu se nahraje logo
    - Čtvrtý canvas bude sloužit jako výstup
2. Dále webová stránka bude obsahovat kód v Javascriptu, který po načtení stránky provede vykreslení vybraných obrázku do canvasů.
3. Do čtvrtého canvasu na zmáčknutí tlačítka vykreslete scénu vytvořenou sestavením vstupních obrázku dle následujících pravidel
    - Z prvního obrázku (popředí scény) se vybere pouze postava, pozadí se odstraní pomocí klíčování
    - Pozadí se vykreslí na místo vyklíčovaného pozadí z prvního obrázku
    - Logo se převede do šedých tónů a zobrazí se v pravém horním rohu
    - Vznikne tedy obrázek, ve kterém bude zobrazena osoba na vybraném pozadí a v pravém horním rohu bude zobrazeno šedotónové logo
4. Konkrétní implementace je plně ve vašich rukou, pro získání lepšího hodnocení je možné implementovat následující vychytávky:
    - Alpha blending
	- Velikost loga nezávislá na velikosti vstupního obrazu
    - Volitelná barva vyklíčovaného pozadí
    - Volitelný rozsah vyklíčované barvy

## Zásady pro odevzdání domácího úkolu:
Pro řešení úkolu se doporučuje použít následující šablonu: https://gitlab.tul.cz/petr.jecmen/PG/tree/master/cviceni02