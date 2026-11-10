+++
title = "Mietspiegel hesaplayıcısı"
description = "Berlin Mietspiegel'inde dairenize uyan satırı (Feld) bulun ve dairenizi Orientierungshilfe ile aralığa yerleştirin."
template = "rechner.html"
weight = 10
[extra]
nav = true
+++

Berlin Mietspiegel'i (kira tablosu) yerel emsal kirayı (ortsübliche Vergleichsmiete) gösterir: benzer daireler için aylık metrekare başına olağan net kira (Nettokaltmiete; yan giderler ve ısıtma giderleri hariç).

Her satırın (Feld) bir alt değeri, bir orta değeri ve bir üst değeri vardır. Dairenizin bu aralıkta nerede olduğunu beş gruplu Orientierungshilfe (değerlendirme yardımı) gösterir: banyo, mutfak, daire, bina ve çevre. Bir grupta artı özellik eksi özellikten fazlaysa grup artı sayılır, eksi özellik fazlaysa eksi sayılır, eşitlikte sayılmaz. Bir artı grup ile bir eksi grup birbirini götürür. Geriye kalan her artı grup, değeri orta değerden üst değere olan farkın beşte biri kadar yukarı, geriye kalan her eksi grup, orta değerden alt değere olan farkın beşte biri kadar aşağı iter. Örnek: 3 artı grup ve 2 eksi grup, 1 artı grup eder. Bu, kiranın %20 artması demek değildir.
