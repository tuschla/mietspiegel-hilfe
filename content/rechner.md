+++
title = "Mietspiegel-Rechner"
description = "Finden Sie Ihr Feld im Berliner Mietspiegel und ordnen Sie Ihre Wohnung mit der Orientierungshilfe in die Spanne ein."
template = "rechner.html"
weight = 10
[extra]
nav = true
+++

Der Berliner Mietspiegel zeigt die ortsübliche Vergleichsmiete: die übliche Nettokaltmiete (ohne Betriebs- und Heizkosten) pro m² und Monat für ähnliche Wohnungen.

Jedes Feld hat einen unteren Wert, einen Mittelwert und einen oberen Wert. Wo Ihre Wohnung in dieser Spanne liegt, zeigt die Orientierungshilfe mit fünf Gruppen: Bad, Küche, Wohnung, Gebäude und Wohnumfeld. Hat eine Gruppe mehr Plus- als Minus-Merkmale, zählt sie als Plus, bei mehr Minus-Merkmalen als Minus, bei Gleichstand nicht. Eine Plus-Gruppe und eine Minus-Gruppe heben sich auf. Jede übrige Plus-Gruppe schiebt den Wert um ein Fünftel des Abstands vom Mittelwert zum oberen Wert nach oben, jede übrige Minus-Gruppe um ein Fünftel des Abstands vom Mittelwert zum unteren Wert nach unten. Beispiel: 3 Plus-Gruppen und 2 Minus-Gruppen ergeben 1 Plus-Gruppe. Das sind nicht 20 % mehr Miete.
