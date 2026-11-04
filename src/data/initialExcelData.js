// Données initiales extraites automatiquement depuis Desktop/GestionP.xlsx
// Toutes les feuilles : Poulets_Boxes, Production, Stockage, Facture, Constructions, Autres_Depenses, Salaires, Bilan, Liste_employe

export const INITIAL_POULETS_BOXES = {
  "dateInitiale": "2026-03-24",
  "boxe1Initial": 4051,
  "boxe2Initial": 3952,
  "malesInitial": 17,
  "totalInitial": 8020,
  "entries": [
    {
      "id": "pb_1",
      "date": "2026-03-24",
      "boxe1": 4051,
      "boxe2": 3952,
      "males": 17,
      "total": 8020,
      "note": "Effectif initial (Boxe 1: 4 051, Boxe 2: 3 382 + 570 = 3 952, + 17 mâles = 8 020)"
    }
  ]
};

export const INITIAL_PRODUCTION = [
  {
    "id": "prod_3",
    "excelRow": 3,
    "date": "2026-04-18",
    "boxe1Produits": 25,
    "boxe2Produits": 11,
    "totalProduits": 36,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 0,
    "restantVivant": 8020
  },
  {
    "id": "prod_4",
    "excelRow": 4,
    "date": "2026-04-19",
    "boxe1Produits": 33,
    "boxe2Produits": 23,
    "totalProduits": 56,
    "boxe1Mortalite": 12,
    "boxe2Mortalite": 1,
    "totalMortalite": 13,
    "tablettesVendues": 0,
    "consoAliment": 0,
    "restantVivant": 8007
  },
  {
    "id": "prod_5",
    "excelRow": 5,
    "date": "2026-04-20",
    "boxe1Produits": 42,
    "boxe2Produits": 32,
    "totalProduits": 74,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 0,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 0,
    "restantVivant": 8006
  },
  {
    "id": "prod_6",
    "excelRow": 6,
    "date": "2026-04-21",
    "boxe1Produits": 48,
    "boxe2Produits": 37,
    "totalProduits": 85,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 0,
    "restantVivant": 8006
  },
  {
    "id": "prod_7",
    "excelRow": 7,
    "date": "2026-04-22",
    "boxe1Produits": 50,
    "boxe2Produits": 39,
    "totalProduits": 89,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 300,
    "consoAliment": 0,
    "restantVivant": 8006
  },
  {
    "id": "prod_8",
    "excelRow": 8,
    "date": "2026-04-23",
    "boxe1Produits": 66,
    "boxe2Produits": 53,
    "totalProduits": 119,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 0,
    "restantVivant": 8006
  },
  {
    "id": "prod_9",
    "excelRow": 9,
    "date": "2026-04-24",
    "boxe1Produits": 77,
    "boxe2Produits": 59,
    "totalProduits": 136,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 0,
    "restantVivant": 8006
  },
  {
    "id": "prod_10",
    "excelRow": 10,
    "date": "2026-04-25",
    "boxe1Produits": 80,
    "boxe2Produits": 66,
    "totalProduits": 146,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 0,
    "restantVivant": 8006
  },
  {
    "id": "prod_11",
    "excelRow": 11,
    "date": "2026-04-26",
    "boxe1Produits": 86,
    "boxe2Produits": 71,
    "totalProduits": 157,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 50,
    "consoAliment": 12,
    "restantVivant": 8006
  },
  {
    "id": "prod_12",
    "excelRow": 12,
    "date": "2026-04-27",
    "boxe1Produits": 88,
    "boxe2Produits": 74,
    "totalProduits": 162,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 12,
    "restantVivant": 8006
  },
  {
    "id": "prod_13",
    "excelRow": 13,
    "date": "2026-04-28",
    "boxe1Produits": 93,
    "boxe2Produits": 76,
    "totalProduits": 169,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 600,
    "consoAliment": 12,
    "restantVivant": 8006
  },
  {
    "id": "prod_14",
    "excelRow": 14,
    "date": "2026-04-29",
    "boxe1Produits": 91,
    "boxe2Produits": 80,
    "totalProduits": 171,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 0,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 12,
    "restantVivant": 8004
  },
  {
    "id": "prod_15",
    "excelRow": 15,
    "date": "2026-04-30",
    "boxe1Produits": 88,
    "boxe2Produits": 89,
    "totalProduits": 177,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 12,
    "restantVivant": 8003
  },
  {
    "id": "prod_16",
    "excelRow": 16,
    "date": "2026-05-01",
    "boxe1Produits": 84,
    "boxe2Produits": 79,
    "totalProduits": 163,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 0,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 12,
    "restantVivant": 8002
  },
  {
    "id": "prod_17",
    "excelRow": 17,
    "date": "2026-05-02",
    "boxe1Produits": 86,
    "boxe2Produits": 81,
    "totalProduits": 167,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 0,
    "totalMortalite": 1,
    "tablettesVendues": 948,
    "consoAliment": 15,
    "restantVivant": 8001
  },
  {
    "id": "prod_18",
    "excelRow": 18,
    "date": "2026-05-03",
    "boxe1Produits": 86,
    "boxe2Produits": 82,
    "totalProduits": 168,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 0,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 15,
    "restantVivant": 8000
  },
  {
    "id": "prod_19",
    "excelRow": 19,
    "date": "2026-05-04",
    "boxe1Produits": 84,
    "boxe2Produits": 82,
    "totalProduits": 166,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 0,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 15,
    "restantVivant": 7998
  },
  {
    "id": "prod_20",
    "excelRow": 20,
    "date": "2026-05-05",
    "boxe1Produits": 86,
    "boxe2Produits": 84,
    "totalProduits": 170,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 0,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 15,
    "restantVivant": 7997
  },
  {
    "id": "prod_21",
    "excelRow": 21,
    "date": "2026-05-06",
    "boxe1Produits": 88,
    "boxe2Produits": 85,
    "totalProduits": 173,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 0,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 15,
    "restantVivant": 7995
  },
  {
    "id": "prod_22",
    "excelRow": 22,
    "date": "2026-05-07",
    "boxe1Produits": 92,
    "boxe2Produits": 86,
    "totalProduits": 178,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 15,
    "restantVivant": 7995
  },
  {
    "id": "prod_23",
    "excelRow": 23,
    "date": "2026-05-08",
    "boxe1Produits": 88,
    "boxe2Produits": 82,
    "totalProduits": 170,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 100,
    "consoAliment": 15,
    "restantVivant": 7995
  },
  {
    "id": "prod_24",
    "excelRow": 24,
    "date": "2026-05-09",
    "boxe1Produits": 87,
    "boxe2Produits": 90,
    "totalProduits": 177,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 1100,
    "consoAliment": 16,
    "restantVivant": 7994
  },
  {
    "id": "prod_25",
    "excelRow": 25,
    "date": "2026-05-10",
    "boxe1Produits": 88,
    "boxe2Produits": 91,
    "totalProduits": 179,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 2,
    "totalMortalite": 4,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7990
  },
  {
    "id": "prod_26",
    "excelRow": 26,
    "date": "2026-05-11",
    "boxe1Produits": 88,
    "boxe2Produits": 92,
    "totalProduits": 180,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7990
  },
  {
    "id": "prod_27",
    "excelRow": 27,
    "date": "2026-05-12",
    "boxe1Produits": 89,
    "boxe2Produits": 94,
    "totalProduits": 183,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 500,
    "consoAliment": 16,
    "restantVivant": 7989
  },
  {
    "id": "prod_28",
    "excelRow": 28,
    "date": "2026-05-13",
    "boxe1Produits": 89,
    "boxe2Produits": 94,
    "totalProduits": 183,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7989
  },
  {
    "id": "prod_29",
    "excelRow": 29,
    "date": "2026-05-14",
    "boxe1Produits": 89,
    "boxe2Produits": 95,
    "totalProduits": 184,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 100,
    "consoAliment": 16,
    "restantVivant": 7989
  },
  {
    "id": "prod_30",
    "excelRow": 30,
    "date": "2026-05-15",
    "boxe1Produits": 90,
    "boxe2Produits": 93,
    "totalProduits": 183,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 3,
    "totalMortalite": 4,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7985
  },
  {
    "id": "prod_31",
    "excelRow": 31,
    "date": "2026-05-16",
    "boxe1Produits": 94,
    "boxe2Produits": 95,
    "totalProduits": 189,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 4,
    "totalMortalite": 4,
    "tablettesVendues": 685,
    "consoAliment": 16,
    "restantVivant": 7981
  },
  {
    "id": "prod_32",
    "excelRow": 32,
    "date": "2026-05-17",
    "boxe1Produits": 93,
    "boxe2Produits": 95,
    "totalProduits": 188,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7981
  },
  {
    "id": "prod_33",
    "excelRow": 33,
    "date": "2026-05-18",
    "boxe1Produits": 94,
    "boxe2Produits": 93,
    "totalProduits": 187,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7981
  },
  {
    "id": "prod_34",
    "excelRow": 34,
    "date": "2026-05-19",
    "boxe1Produits": 96,
    "boxe2Produits": 95,
    "totalProduits": 191,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 11,
    "consoAliment": 16,
    "restantVivant": 7979
  },
  {
    "id": "prod_35",
    "excelRow": 35,
    "date": "2026-05-20",
    "boxe1Produits": 97,
    "boxe2Produits": 95,
    "totalProduits": 192,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 500,
    "consoAliment": 16,
    "restantVivant": 7977
  },
  {
    "id": "prod_36",
    "excelRow": 36,
    "date": "2026-05-21",
    "boxe1Produits": 97,
    "boxe2Produits": 95,
    "totalProduits": 192,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7975
  },
  {
    "id": "prod_37",
    "excelRow": 37,
    "date": "2026-05-22",
    "boxe1Produits": 97,
    "boxe2Produits": 95,
    "totalProduits": 192,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7974
  },
  {
    "id": "prod_38",
    "excelRow": 38,
    "date": "2026-05-23",
    "boxe1Produits": 97,
    "boxe2Produits": 95,
    "totalProduits": 192,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 2,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7971
  },
  {
    "id": "prod_39",
    "excelRow": 39,
    "date": "2026-05-24",
    "boxe1Produits": 100,
    "boxe2Produits": 95,
    "totalProduits": 195,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 1010,
    "consoAliment": 16,
    "restantVivant": 7969
  },
  {
    "id": "prod_40",
    "excelRow": 40,
    "date": "2026-05-25",
    "boxe1Produits": 99,
    "boxe2Produits": 94,
    "totalProduits": 193,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7967
  },
  {
    "id": "prod_41",
    "excelRow": 41,
    "date": "2026-05-26",
    "boxe1Produits": 102,
    "boxe2Produits": 95,
    "totalProduits": 197,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7967
  },
  {
    "id": "prod_42",
    "excelRow": 42,
    "date": "2026-05-27",
    "boxe1Produits": 103,
    "boxe2Produits": 95,
    "totalProduits": 198,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7965
  },
  {
    "id": "prod_43",
    "excelRow": 43,
    "date": "2026-05-28",
    "boxe1Produits": 102,
    "boxe2Produits": 96,
    "totalProduits": 198,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7965
  },
  {
    "id": "prod_44",
    "excelRow": 44,
    "date": "2026-05-29",
    "boxe1Produits": 102,
    "boxe2Produits": 97,
    "totalProduits": 199,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 100,
    "consoAliment": 16,
    "restantVivant": 7963
  },
  {
    "id": "prod_45",
    "excelRow": 45,
    "date": "2026-05-30",
    "boxe1Produits": 105,
    "boxe2Produits": 96,
    "totalProduits": 201,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7961
  },
  {
    "id": "prod_46",
    "excelRow": 46,
    "date": "2026-05-31",
    "boxe1Produits": 105,
    "boxe2Produits": 95,
    "totalProduits": 200,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7959
  },
  {
    "id": "prod_47",
    "excelRow": 47,
    "date": "2026-06-01",
    "boxe1Produits": 105,
    "boxe2Produits": 96,
    "totalProduits": 201,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7957
  },
  {
    "id": "prod_48",
    "excelRow": 48,
    "date": "2026-06-02",
    "boxe1Produits": 110,
    "boxe2Produits": 97,
    "totalProduits": 207,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 1690,
    "consoAliment": 16,
    "restantVivant": 7955
  },
  {
    "id": "prod_49",
    "excelRow": 49,
    "date": "2026-06-03",
    "boxe1Produits": 109,
    "boxe2Produits": 101,
    "totalProduits": 210,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 3,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7952
  },
  {
    "id": "prod_50",
    "excelRow": 50,
    "date": "2026-06-04",
    "boxe1Produits": 110,
    "boxe2Produits": 100,
    "totalProduits": 210,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7951
  },
  {
    "id": "prod_51",
    "excelRow": 51,
    "date": "2026-06-05",
    "boxe1Produits": 115,
    "boxe2Produits": 99,
    "totalProduits": 214,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 3,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7948
  },
  {
    "id": "prod_52",
    "excelRow": 52,
    "date": "2026-06-06",
    "boxe1Produits": 114,
    "boxe2Produits": 100,
    "totalProduits": 214,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7948
  },
  {
    "id": "prod_53",
    "excelRow": 53,
    "date": "2026-06-07",
    "boxe1Produits": 119,
    "boxe2Produits": 102,
    "totalProduits": 221,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7946
  },
  {
    "id": "prod_54",
    "excelRow": 54,
    "date": "2026-06-08",
    "boxe1Produits": 115,
    "boxe2Produits": 100,
    "totalProduits": 215,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7946
  },
  {
    "id": "prod_55",
    "excelRow": 55,
    "date": "2026-06-09",
    "boxe1Produits": 117,
    "boxe2Produits": 102,
    "totalProduits": 219,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7946
  },
  {
    "id": "prod_56",
    "excelRow": 56,
    "date": "2026-06-10",
    "boxe1Produits": 117,
    "boxe2Produits": 104,
    "totalProduits": 221,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7946
  },
  {
    "id": "prod_57",
    "excelRow": 57,
    "date": "2026-06-11",
    "boxe1Produits": 116,
    "boxe2Produits": 102,
    "totalProduits": 218,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7946
  },
  {
    "id": "prod_58",
    "excelRow": 58,
    "date": "2026-06-12",
    "boxe1Produits": 119,
    "boxe2Produits": 104,
    "totalProduits": 223,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7944
  },
  {
    "id": "prod_59",
    "excelRow": 59,
    "date": "2026-06-13",
    "boxe1Produits": 115,
    "boxe2Produits": 105,
    "totalProduits": 220,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 1700,
    "consoAliment": 16,
    "restantVivant": 7942
  },
  {
    "id": "prod_60",
    "excelRow": 60,
    "date": "2026-06-14",
    "boxe1Produits": 121,
    "boxe2Produits": 108,
    "totalProduits": 229,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7940
  },
  {
    "id": "prod_61",
    "excelRow": 61,
    "date": "2026-06-15",
    "boxe1Produits": 120,
    "boxe2Produits": 109,
    "totalProduits": 229,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 700,
    "consoAliment": 16,
    "restantVivant": 7940
  },
  {
    "id": "prod_62",
    "excelRow": 62,
    "date": "2026-06-16",
    "boxe1Produits": 113,
    "boxe2Produits": 110,
    "totalProduits": 223,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7940
  },
  {
    "id": "prod_63",
    "excelRow": 63,
    "date": "2026-06-17",
    "boxe1Produits": 119,
    "boxe2Produits": 110,
    "totalProduits": 229,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7938
  },
  {
    "id": "prod_64",
    "excelRow": 64,
    "date": "2026-06-18",
    "boxe1Produits": 118,
    "boxe2Produits": 110,
    "totalProduits": 228,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 1,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7935
  },
  {
    "id": "prod_65",
    "excelRow": 65,
    "date": "2026-06-19",
    "boxe1Produits": 119,
    "boxe2Produits": 111,
    "totalProduits": 230,
    "boxe1Mortalite": 4,
    "boxe2Mortalite": 0,
    "totalMortalite": 4,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7931
  },
  {
    "id": "prod_66",
    "excelRow": 66,
    "date": "2026-06-20",
    "boxe1Produits": 113,
    "boxe2Produits": 112,
    "totalProduits": 225,
    "boxe1Mortalite": 4,
    "boxe2Mortalite": 0,
    "totalMortalite": 4,
    "tablettesVendues": 1500,
    "consoAliment": 16,
    "restantVivant": 7927
  },
  {
    "id": "prod_67",
    "excelRow": 67,
    "date": "2026-06-21",
    "boxe1Produits": 118,
    "boxe2Produits": 110,
    "totalProduits": 228,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 3,
    "totalMortalite": 5,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7922
  },
  {
    "id": "prod_68",
    "excelRow": 68,
    "date": "2026-06-22",
    "boxe1Produits": 117,
    "boxe2Produits": 111,
    "totalProduits": 228,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 2,
    "totalMortalite": 4,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7918
  },
  {
    "id": "prod_69",
    "excelRow": 69,
    "date": "2026-06-23",
    "boxe1Produits": 115,
    "boxe2Produits": 113,
    "totalProduits": 228,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 0,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7917
  },
  {
    "id": "prod_70",
    "excelRow": 70,
    "date": "2026-06-24",
    "boxe1Produits": 118,
    "boxe2Produits": 112,
    "totalProduits": 230,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7915
  },
  {
    "id": "prod_71",
    "excelRow": 71,
    "date": "2026-06-25",
    "boxe1Produits": 119,
    "boxe2Produits": 115,
    "totalProduits": 234,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7913
  },
  {
    "id": "prod_72",
    "excelRow": 72,
    "date": "2026-06-26",
    "boxe1Produits": 118,
    "boxe2Produits": 114,
    "totalProduits": 232,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 3,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7910
  },
  {
    "id": "prod_73",
    "excelRow": 73,
    "date": "2026-06-27",
    "boxe1Produits": 120,
    "boxe2Produits": 114,
    "totalProduits": 234,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 4,
    "totalMortalite": 4,
    "tablettesVendues": 35,
    "consoAliment": 16,
    "restantVivant": 7906
  },
  {
    "id": "prod_74",
    "excelRow": 74,
    "date": "2026-06-28",
    "boxe1Produits": 120,
    "boxe2Produits": 116,
    "totalProduits": 236,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7904
  },
  {
    "id": "prod_75",
    "excelRow": 75,
    "date": "2026-06-29",
    "boxe1Produits": 119,
    "boxe2Produits": 113,
    "totalProduits": 232,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 1650,
    "consoAliment": 16,
    "restantVivant": 7904
  },
  {
    "id": "prod_76",
    "excelRow": 76,
    "date": "2026-06-30",
    "boxe1Produits": 122,
    "boxe2Produits": 119,
    "totalProduits": 241,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 15,
    "consoAliment": 16,
    "restantVivant": 7904
  },
  {
    "id": "prod_77",
    "excelRow": 77,
    "date": "2026-07-01",
    "boxe1Produits": 122,
    "boxe2Produits": 118,
    "totalProduits": 240,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7902
  },
  {
    "id": "prod_78",
    "excelRow": 78,
    "date": "2026-07-02",
    "boxe1Produits": 120,
    "boxe2Produits": 113,
    "totalProduits": 233,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 15,
    "consoAliment": 16,
    "restantVivant": 7902
  },
  {
    "id": "prod_79",
    "excelRow": 79,
    "date": "2026-07-03",
    "boxe1Produits": 120,
    "boxe2Produits": 115,
    "totalProduits": 235,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 2,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7899
  },
  {
    "id": "prod_80",
    "excelRow": 80,
    "date": "2026-07-04",
    "boxe1Produits": 121,
    "boxe2Produits": 115,
    "totalProduits": 236,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 2,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7896
  },
  {
    "id": "prod_81",
    "excelRow": 81,
    "date": "2026-07-05",
    "boxe1Produits": 122,
    "boxe2Produits": 114,
    "totalProduits": 236,
    "boxe1Mortalite": 3,
    "boxe2Mortalite": 0,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7893
  },
  {
    "id": "prod_82",
    "excelRow": 82,
    "date": "2026-07-06",
    "boxe1Produits": 122,
    "boxe2Produits": 116,
    "totalProduits": 238,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 0,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7891
  },
  {
    "id": "prod_83",
    "excelRow": 83,
    "date": "2026-07-07",
    "boxe1Produits": 122,
    "boxe2Produits": 116,
    "totalProduits": 238,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 1500,
    "consoAliment": 16,
    "restantVivant": 7890
  },
  {
    "id": "prod_84",
    "excelRow": 84,
    "date": "2026-07-08",
    "boxe1Produits": 123,
    "boxe2Produits": 117,
    "totalProduits": 240,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 30,
    "consoAliment": 16,
    "restantVivant": 7889
  },
  {
    "id": "prod_85",
    "excelRow": 85,
    "date": "2026-07-09",
    "boxe1Produits": 122,
    "boxe2Produits": 118,
    "totalProduits": 240,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 3,
    "totalMortalite": 3,
    "tablettesVendues": 20,
    "consoAliment": 16,
    "restantVivant": 7886
  },
  {
    "id": "prod_86",
    "excelRow": 86,
    "date": "2026-07-10",
    "boxe1Produits": 122,
    "boxe2Produits": 119,
    "totalProduits": 241,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7885
  },
  {
    "id": "prod_87",
    "excelRow": 87,
    "date": "2026-07-11",
    "boxe1Produits": 122,
    "boxe2Produits": 119,
    "totalProduits": 241,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7883
  },
  {
    "id": "prod_88",
    "excelRow": 88,
    "date": "2026-07-12",
    "boxe1Produits": 121,
    "boxe2Produits": 119,
    "totalProduits": 240,
    "boxe1Mortalite": 3,
    "boxe2Mortalite": 0,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7880
  },
  {
    "id": "prod_89",
    "excelRow": 89,
    "date": "2026-07-13",
    "boxe1Produits": 121,
    "boxe2Produits": 119,
    "totalProduits": 240,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 0,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7879
  },
  {
    "id": "prod_90",
    "excelRow": 90,
    "date": "2026-07-14",
    "boxe1Produits": 124,
    "boxe2Produits": 117,
    "totalProduits": 241,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 3,
    "totalMortalite": 3,
    "tablettesVendues": 2100,
    "consoAliment": 16,
    "restantVivant": 7876
  },
  {
    "id": "prod_91",
    "excelRow": 91,
    "date": "2026-07-15",
    "boxe1Produits": 120,
    "boxe2Produits": 118,
    "totalProduits": 238,
    "boxe1Mortalite": 3,
    "boxe2Mortalite": 7,
    "totalMortalite": 10,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7866
  },
  {
    "id": "prod_92",
    "excelRow": 92,
    "date": "2026-07-16",
    "boxe1Produits": 120,
    "boxe2Produits": 117,
    "totalProduits": 237,
    "boxe1Mortalite": 4,
    "boxe2Mortalite": 3,
    "totalMortalite": 7,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7859
  },
  {
    "id": "prod_93",
    "excelRow": 93,
    "date": "2026-07-17",
    "boxe1Produits": 121,
    "boxe2Produits": 117,
    "totalProduits": 238,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 4,
    "totalMortalite": 4,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7855
  },
  {
    "id": "prod_94",
    "excelRow": 94,
    "date": "2026-07-18",
    "boxe1Produits": 122,
    "boxe2Produits": 118,
    "totalProduits": 240,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 6,
    "totalMortalite": 6,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7849
  },
  {
    "id": "prod_95",
    "excelRow": 95,
    "date": "2026-07-19",
    "boxe1Produits": 122,
    "boxe2Produits": 118,
    "totalProduits": 240,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 0,
    "totalMortalite": 1,
    "tablettesVendues": 450,
    "consoAliment": 16,
    "restantVivant": 7848
  },
  {
    "id": "prod_96",
    "excelRow": 96,
    "date": "2026-07-20",
    "boxe1Produits": 123,
    "boxe2Produits": 118,
    "totalProduits": 241,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 0,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7846
  },
  {
    "id": "prod_97",
    "excelRow": 97,
    "date": "2026-07-21",
    "boxe1Produits": 119,
    "boxe2Produits": 118,
    "totalProduits": 237,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 6
  },
  {
    "id": "prod_98",
    "excelRow": 98,
    "date": "2026-07-22",
    "boxe1Produits": 121,
    "boxe2Produits": 117,
    "totalProduits": 238,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 1,
    "totalMortalite": 3,
    "tablettesVendues": 1700,
    "consoAliment": 16,
    "restantVivant": 7843
  },
  {
    "id": "prod_99",
    "excelRow": 99,
    "date": "2026-07-23",
    "boxe1Produits": 123,
    "boxe2Produits": 117,
    "totalProduits": 240,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7842
  },
  {
    "id": "prod_100",
    "excelRow": 100,
    "date": "2026-07-24",
    "boxe1Produits": 118,
    "boxe2Produits": 118,
    "totalProduits": 236,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7840
  },
  {
    "id": "prod_101",
    "excelRow": 101,
    "date": "2026-07-25",
    "boxe1Produits": 123,
    "boxe2Produits": 116,
    "totalProduits": 239,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7840
  },
  {
    "id": "prod_102",
    "excelRow": 102,
    "date": "2026-07-26",
    "boxe1Produits": 121,
    "boxe2Produits": 117,
    "totalProduits": 238,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7838
  },
  {
    "id": "prod_103",
    "excelRow": 103,
    "date": "2026-07-27",
    "boxe1Produits": 123,
    "boxe2Produits": 117,
    "totalProduits": 240,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 10,
    "consoAliment": 16,
    "restantVivant": 7838
  },
  {
    "id": "prod_104",
    "excelRow": 104,
    "date": "2026-07-28",
    "boxe1Produits": 122,
    "boxe2Produits": 116,
    "totalProduits": 238,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 2,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7835
  },
  {
    "id": "prod_105",
    "excelRow": 105,
    "date": "2026-07-29",
    "boxe1Produits": 120,
    "boxe2Produits": 116,
    "totalProduits": 236,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 1700,
    "consoAliment": 16,
    "restantVivant": 7834
  },
  {
    "id": "prod_106",
    "excelRow": 106,
    "date": "2026-07-30",
    "boxe1Produits": 122,
    "boxe2Produits": 118,
    "totalProduits": 240,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7832
  },
  {
    "id": "prod_107",
    "excelRow": 107,
    "date": "2026-07-31",
    "boxe1Produits": 120,
    "boxe2Produits": 117,
    "totalProduits": 237,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7830
  },
  {
    "id": "prod_108",
    "excelRow": 108,
    "date": "2026-08-01",
    "boxe1Produits": 122,
    "boxe2Produits": 119,
    "totalProduits": 241,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7829
  },
  {
    "id": "prod_109",
    "excelRow": 109,
    "date": "2026-08-02",
    "boxe1Produits": 124,
    "boxe2Produits": 118,
    "totalProduits": 242,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7829
  },
  {
    "id": "prod_110",
    "excelRow": 110,
    "date": "2026-08-03",
    "boxe1Produits": 123,
    "boxe2Produits": 116,
    "totalProduits": 239,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7829
  },
  {
    "id": "prod_111",
    "excelRow": 111,
    "date": "2026-08-04",
    "boxe1Produits": 122,
    "boxe2Produits": 118,
    "totalProduits": 240,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 3,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7826
  },
  {
    "id": "prod_112",
    "excelRow": 112,
    "date": "2026-08-05",
    "boxe1Produits": 122,
    "boxe2Produits": 120,
    "totalProduits": 242,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 1700,
    "consoAliment": 16,
    "restantVivant": 7824
  },
  {
    "id": "prod_113",
    "excelRow": 113,
    "date": "2026-08-06",
    "boxe1Produits": 122,
    "boxe2Produits": 118,
    "totalProduits": 240,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7823
  },
  {
    "id": "prod_114",
    "excelRow": 114,
    "date": "2026-08-07",
    "boxe1Produits": 124,
    "boxe2Produits": 117,
    "totalProduits": 241,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7821
  },
  {
    "id": "prod_115",
    "excelRow": 115,
    "date": "2026-08-08",
    "boxe1Produits": 123,
    "boxe2Produits": 119,
    "totalProduits": 242,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7820
  },
  {
    "id": "prod_116",
    "excelRow": 116,
    "date": "2026-08-09",
    "boxe1Produits": 122,
    "boxe2Produits": 119,
    "totalProduits": 241,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 3,
    "totalMortalite": 4,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7816
  },
  {
    "id": "prod_117",
    "excelRow": 117,
    "date": "2026-08-10",
    "boxe1Produits": 122,
    "boxe2Produits": 115,
    "totalProduits": 237,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7814
  },
  {
    "id": "prod_118",
    "excelRow": 118,
    "date": "2026-08-11",
    "boxe1Produits": 122,
    "boxe2Produits": 118,
    "totalProduits": 240,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 3,
    "totalMortalite": 3,
    "tablettesVendues": 20,
    "consoAliment": 16,
    "restantVivant": 7811
  },
  {
    "id": "prod_119",
    "excelRow": 119,
    "date": "2026-08-12",
    "boxe1Produits": 122,
    "boxe2Produits": 118,
    "totalProduits": 240,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 2,
    "totalMortalite": 3,
    "tablettesVendues": 1660,
    "consoAliment": 16,
    "restantVivant": 7808
  },
  {
    "id": "prod_120",
    "excelRow": 120,
    "date": "2026-08-13",
    "boxe1Produits": 124,
    "boxe2Produits": 115,
    "totalProduits": 239,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7807
  },
  {
    "id": "prod_121",
    "excelRow": 121,
    "date": "2026-08-14",
    "boxe1Produits": 123,
    "boxe2Produits": 115,
    "totalProduits": 238,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7805
  },
  {
    "id": "prod_122",
    "excelRow": 122,
    "date": "2026-08-15",
    "boxe1Produits": 122,
    "boxe2Produits": 115,
    "totalProduits": 237,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7805
  },
  {
    "id": "prod_123",
    "excelRow": 123,
    "date": "2026-08-16",
    "boxe1Produits": 125,
    "boxe2Produits": 118,
    "totalProduits": 243,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 15,
    "consoAliment": 16,
    "restantVivant": 7805
  },
  {
    "id": "prod_124",
    "excelRow": 124,
    "date": "2026-08-17",
    "boxe1Produits": 121,
    "boxe2Produits": 119,
    "totalProduits": 240,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 600,
    "consoAliment": 16,
    "restantVivant": 7805
  },
  {
    "id": "prod_125",
    "excelRow": 125,
    "date": "2026-08-18",
    "boxe1Produits": 124,
    "boxe2Produits": 119,
    "totalProduits": 243,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 0,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7803
  },
  {
    "id": "prod_126",
    "excelRow": 126,
    "date": "2026-08-19",
    "boxe1Produits": 125,
    "boxe2Produits": 119,
    "totalProduits": 244,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 1050,
    "consoAliment": 16,
    "restantVivant": 7802
  },
  {
    "id": "prod_127",
    "excelRow": 127,
    "date": "2026-08-20",
    "boxe1Produits": 124,
    "boxe2Produits": 114,
    "totalProduits": 238,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 3,
    "totalMortalite": 3,
    "tablettesVendues": 10,
    "consoAliment": 16,
    "restantVivant": 7799
  },
  {
    "id": "prod_128",
    "excelRow": 128,
    "date": "2026-08-21",
    "boxe1Produits": 121,
    "boxe2Produits": 116,
    "totalProduits": 237,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7797
  },
  {
    "id": "prod_129",
    "excelRow": 129,
    "date": "2026-08-22",
    "boxe1Produits": 121,
    "boxe2Produits": 117,
    "totalProduits": 238,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7797
  },
  {
    "id": "prod_130",
    "excelRow": 130,
    "date": "2026-08-23",
    "boxe1Produits": 123,
    "boxe2Produits": 117,
    "totalProduits": 240,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 1,
    "totalMortalite": 3,
    "tablettesVendues": 950,
    "consoAliment": 16,
    "restantVivant": 7794
  },
  {
    "id": "prod_131",
    "excelRow": 131,
    "date": "2026-08-24",
    "boxe1Produits": 120,
    "boxe2Produits": 116,
    "totalProduits": 236,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 0,
    "restantVivant": 7794
  },
  {
    "id": "prod_132",
    "excelRow": 132,
    "date": "2026-08-25",
    "boxe1Produits": 122,
    "boxe2Produits": 115,
    "totalProduits": 237,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7792
  },
  {
    "id": "prod_133",
    "excelRow": 133,
    "date": "2026-08-26",
    "boxe1Produits": 121,
    "boxe2Produits": 113,
    "totalProduits": 234,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 2,
    "totalMortalite": 3,
    "tablettesVendues": 5,
    "consoAliment": 16,
    "restantVivant": 7789
  },
  {
    "id": "prod_134",
    "excelRow": 134,
    "date": "2026-08-27",
    "boxe1Produits": 121,
    "boxe2Produits": 116,
    "totalProduits": 237,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 3,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7786
  },
  {
    "id": "prod_135",
    "excelRow": 135,
    "date": "2026-08-28",
    "boxe1Produits": 120,
    "boxe2Produits": 115,
    "totalProduits": 235,
    "boxe1Mortalite": 4,
    "boxe2Mortalite": 6,
    "totalMortalite": 10,
    "tablettesVendues": 1130,
    "consoAliment": 16,
    "restantVivant": 7776
  },
  {
    "id": "prod_136",
    "excelRow": 136,
    "date": "2026-08-29",
    "boxe1Produits": 121,
    "boxe2Produits": 114,
    "totalProduits": 235,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 3,
    "totalMortalite": 4,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7772
  },
  {
    "id": "prod_137",
    "excelRow": 137,
    "date": "2026-08-30",
    "boxe1Produits": 121,
    "boxe2Produits": 115,
    "totalProduits": 236,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 2,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7769
  },
  {
    "id": "prod_138",
    "excelRow": 138,
    "date": "2026-08-31",
    "boxe1Produits": 120,
    "boxe2Produits": 115,
    "totalProduits": 235,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 2,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7766
  },
  {
    "id": "prod_139",
    "excelRow": 139,
    "date": "2026-09-01",
    "boxe1Produits": 120,
    "boxe2Produits": 110,
    "totalProduits": 230,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 13,
    "totalMortalite": 14,
    "tablettesVendues": 560,
    "consoAliment": 16,
    "restantVivant": 7752
  },
  {
    "id": "prod_140",
    "excelRow": 140,
    "date": "2026-09-02",
    "boxe1Produits": 119,
    "boxe2Produits": 113,
    "totalProduits": 232,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 6,
    "totalMortalite": 8,
    "tablettesVendues": 0,
    "consoAliment": 10,
    "restantVivant": 7744
  },
  {
    "id": "prod_141",
    "excelRow": 141,
    "date": "2026-09-03",
    "boxe1Produits": 118,
    "boxe2Produits": 111,
    "totalProduits": 229,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 4,
    "totalMortalite": 4,
    "tablettesVendues": 0,
    "consoAliment": 0,
    "restantVivant": 7740
  },
  {
    "id": "prod_142",
    "excelRow": 142,
    "date": "2026-09-04",
    "boxe1Produits": 119,
    "boxe2Produits": 106,
    "totalProduits": 225,
    "boxe1Mortalite": 3,
    "boxe2Mortalite": 1,
    "totalMortalite": 4,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7736
  },
  {
    "id": "prod_143",
    "excelRow": 143,
    "date": "2026-09-05",
    "boxe1Produits": 119,
    "boxe2Produits": 110,
    "totalProduits": 229,
    "boxe1Mortalite": 3,
    "boxe2Mortalite": 13,
    "totalMortalite": 16,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7720
  },
  {
    "id": "prod_144",
    "excelRow": 144,
    "date": "2026-09-06",
    "boxe1Produits": 119,
    "boxe2Produits": 106,
    "totalProduits": 225,
    "boxe1Mortalite": 6,
    "boxe2Mortalite": 17,
    "totalMortalite": 23,
    "tablettesVendues": 1500,
    "consoAliment": 16,
    "restantVivant": 7697
  },
  {
    "id": "prod_145",
    "excelRow": 145,
    "date": "2026-09-07",
    "boxe1Produits": 112,
    "boxe2Produits": 106,
    "totalProduits": 218,
    "boxe1Mortalite": 6,
    "boxe2Mortalite": 10,
    "totalMortalite": 16,
    "tablettesVendues": 0,
    "consoAliment": 15,
    "restantVivant": 7681
  },
  {
    "id": "prod_146",
    "excelRow": 146,
    "date": "2026-09-08",
    "boxe1Produits": 114,
    "boxe2Produits": 107,
    "totalProduits": 221,
    "boxe1Mortalite": 6,
    "boxe2Mortalite": 6,
    "totalMortalite": 12,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7669
  },
  {
    "id": "prod_147",
    "excelRow": 147,
    "date": "2026-09-09",
    "boxe1Produits": 113,
    "boxe2Produits": 108,
    "totalProduits": 221,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7669
  },
  {
    "id": "prod_148",
    "excelRow": 148,
    "date": "2026-09-10",
    "boxe1Produits": 117,
    "boxe2Produits": 110,
    "totalProduits": 227,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 3,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7666
  },
  {
    "id": "prod_149",
    "excelRow": 149,
    "date": "2026-09-11",
    "boxe1Produits": 123,
    "boxe2Produits": 106,
    "totalProduits": 229,
    "boxe1Mortalite": 4,
    "boxe2Mortalite": 0,
    "totalMortalite": 4,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7662
  },
  {
    "id": "prod_150",
    "excelRow": 150,
    "date": "2026-09-12",
    "boxe1Produits": 100,
    "boxe2Produits": 106,
    "totalProduits": 206,
    "boxe1Mortalite": 5,
    "boxe2Mortalite": 2,
    "totalMortalite": 7,
    "tablettesVendues": 600,
    "consoAliment": 14,
    "restantVivant": 7655
  },
  {
    "id": "prod_151",
    "excelRow": 151,
    "date": "2026-09-13",
    "boxe1Produits": 82,
    "boxe2Produits": 106,
    "totalProduits": 188,
    "boxe1Mortalite": 44,
    "boxe2Mortalite": 6,
    "totalMortalite": 50,
    "tablettesVendues": 0,
    "consoAliment": 10,
    "restantVivant": 7605
  },
  {
    "id": "prod_152",
    "excelRow": 152,
    "date": "2026-09-14",
    "boxe1Produits": 82,
    "boxe2Produits": 106,
    "totalProduits": 188,
    "boxe1Mortalite": 20,
    "boxe2Mortalite": 5,
    "totalMortalite": 25,
    "tablettesVendues": 0,
    "consoAliment": 12,
    "restantVivant": 7580
  },
  {
    "id": "prod_153",
    "excelRow": 153,
    "date": "2026-09-15",
    "boxe1Produits": 95,
    "boxe2Produits": 108,
    "totalProduits": 203,
    "boxe1Mortalite": 7,
    "boxe2Mortalite": 1,
    "totalMortalite": 8,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7572
  },
  {
    "id": "prod_154",
    "excelRow": 154,
    "date": "2026-09-16",
    "boxe1Produits": 97,
    "boxe2Produits": 108,
    "totalProduits": 205,
    "boxe1Mortalite": 5,
    "boxe2Mortalite": 1,
    "totalMortalite": 6,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7566
  },
  {
    "id": "prod_155",
    "excelRow": 155,
    "date": "2026-09-17",
    "boxe1Produits": 98,
    "boxe2Produits": 109,
    "totalProduits": 207,
    "boxe1Mortalite": 6,
    "boxe2Mortalite": 3,
    "totalMortalite": 9,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7557
  },
  {
    "id": "prod_156",
    "excelRow": 156,
    "date": "2026-09-18",
    "boxe1Produits": 96,
    "boxe2Produits": 106,
    "totalProduits": 202,
    "boxe1Mortalite": 5,
    "boxe2Mortalite": 1,
    "totalMortalite": 6,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7551
  },
  {
    "id": "prod_157",
    "excelRow": 157,
    "date": "2026-09-19",
    "boxe1Produits": 99,
    "boxe2Produits": 107,
    "totalProduits": 206,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 50,
    "consoAliment": 14,
    "restantVivant": 7549
  },
  {
    "id": "prod_158",
    "excelRow": 158,
    "date": "2026-09-20",
    "boxe1Produits": 107,
    "boxe2Produits": 101,
    "totalProduits": 208,
    "boxe1Mortalite": 4,
    "boxe2Mortalite": 2,
    "totalMortalite": 6,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7543
  },
  {
    "id": "prod_159",
    "excelRow": 159,
    "date": "2026-09-21",
    "boxe1Produits": 106,
    "boxe2Produits": 108,
    "totalProduits": 214,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 15,
    "consoAliment": 14,
    "restantVivant": 7543
  },
  {
    "id": "prod_160",
    "excelRow": 160,
    "date": "2026-09-22",
    "boxe1Produits": 106,
    "boxe2Produits": 107,
    "totalProduits": 213,
    "boxe1Mortalite": 4,
    "boxe2Mortalite": 3,
    "totalMortalite": 7,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7536
  },
  {
    "id": "prod_161",
    "excelRow": 161,
    "date": "2026-09-23",
    "boxe1Produits": 105,
    "boxe2Produits": 105,
    "totalProduits": 210,
    "boxe1Mortalite": 4,
    "boxe2Mortalite": 4,
    "totalMortalite": 8,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7528
  },
  {
    "id": "prod_162",
    "excelRow": 162,
    "date": "2026-09-24",
    "boxe1Produits": 109,
    "boxe2Produits": 106,
    "totalProduits": 215,
    "boxe1Mortalite": 6,
    "boxe2Mortalite": 5,
    "totalMortalite": 11,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7517
  },
  {
    "id": "prod_163",
    "excelRow": 163,
    "date": "2026-09-25",
    "boxe1Produits": 109,
    "boxe2Produits": 105,
    "totalProduits": 214,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7515
  },
  {
    "id": "prod_164",
    "excelRow": 164,
    "date": "2026-09-26",
    "boxe1Produits": 109,
    "boxe2Produits": 104,
    "totalProduits": 213,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 3,
    "totalMortalite": 4,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7511
  },
  {
    "id": "prod_165",
    "excelRow": 165,
    "date": "2026-09-27",
    "boxe1Produits": 109,
    "boxe2Produits": 105,
    "totalProduits": 214,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7509
  },
  {
    "id": "prod_166",
    "excelRow": 166,
    "date": "2026-09-28",
    "boxe1Produits": 106,
    "boxe2Produits": 105,
    "totalProduits": 211,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7507
  },
  {
    "id": "prod_167",
    "excelRow": 167,
    "date": "2026-09-29",
    "boxe1Produits": 110,
    "boxe2Produits": 106,
    "totalProduits": 216,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 0,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7505
  },
  {
    "id": "prod_168",
    "excelRow": 168,
    "date": "2026-09-30",
    "boxe1Produits": 110,
    "boxe2Produits": 105,
    "totalProduits": 215,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 1,
    "totalMortalite": 3,
    "tablettesVendues": 1600,
    "consoAliment": 14,
    "restantVivant": 7502
  },
  {
    "id": "prod_169",
    "excelRow": 169,
    "date": "2026-10-01",
    "boxe1Produits": 110,
    "boxe2Produits": 104,
    "totalProduits": 214,
    "boxe1Mortalite": 5,
    "boxe2Mortalite": 4,
    "totalMortalite": 9,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7493
  },
  {
    "id": "prod_170",
    "excelRow": 170,
    "date": "2026-10-02",
    "boxe1Produits": 110,
    "boxe2Produits": 102,
    "totalProduits": 212,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 3,
    "totalMortalite": 5,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7488
  },
  {
    "id": "prod_171",
    "excelRow": 171,
    "date": "2026-10-03",
    "boxe1Produits": 108,
    "boxe2Produits": 104,
    "totalProduits": 212,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7487
  },
  {
    "id": "prod_172",
    "excelRow": 172,
    "date": "2026-10-04",
    "boxe1Produits": 109,
    "boxe2Produits": 102,
    "totalProduits": 211,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7487
  },
  {
    "id": "prod_173",
    "excelRow": 173,
    "date": "2026-10-05",
    "boxe1Produits": 109,
    "boxe2Produits": 103,
    "totalProduits": 212,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 550,
    "consoAliment": 14,
    "restantVivant": 7485
  },
  {
    "id": "prod_174",
    "excelRow": 174,
    "date": "2026-10-06",
    "boxe1Produits": 106,
    "boxe2Produits": 103,
    "totalProduits": 209,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7483
  },
  {
    "id": "prod_175",
    "excelRow": 175,
    "date": "2026-10-07",
    "boxe1Produits": 106,
    "boxe2Produits": 100,
    "totalProduits": 206,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 0,
    "totalMortalite": 0,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7483
  },
  {
    "id": "prod_176",
    "excelRow": 176,
    "date": "2026-10-08",
    "boxe1Produits": 104,
    "boxe2Produits": 97,
    "totalProduits": 201,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 1,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7480
  },
  {
    "id": "prod_177",
    "excelRow": 177,
    "date": "2026-10-09",
    "boxe1Produits": 102,
    "boxe2Produits": 99,
    "totalProduits": 201,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 3,
    "totalMortalite": 5,
    "tablettesVendues": 0,
    "consoAliment": 14,
    "restantVivant": 7475
  },
  {
    "id": "prod_178",
    "excelRow": 178,
    "date": "2026-10-10",
    "boxe1Produits": 106,
    "boxe2Produits": 100,
    "totalProduits": 206,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 3,
    "totalMortalite": 5,
    "tablettesVendues": 700,
    "consoAliment": 14,
    "restantVivant": 7470
  },
  {
    "id": "prod_179",
    "excelRow": 179,
    "date": "2026-10-11",
    "boxe1Produits": 108,
    "boxe2Produits": 102,
    "totalProduits": 210,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 3,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7467
  },
  {
    "id": "prod_180",
    "excelRow": 180,
    "date": "2026-10-12",
    "boxe1Produits": 109,
    "boxe2Produits": 102,
    "totalProduits": 211,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 5,
    "totalMortalite": 6,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7461
  },
  {
    "id": "prod_181",
    "excelRow": 181,
    "date": "2026-10-13",
    "boxe1Produits": 108,
    "boxe2Produits": 102,
    "totalProduits": 210,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 5,
    "totalMortalite": 6,
    "tablettesVendues": 1560,
    "consoAliment": 16,
    "restantVivant": 7455
  },
  {
    "id": "prod_182",
    "excelRow": 182,
    "date": "2026-10-14",
    "boxe1Produits": 109,
    "boxe2Produits": 103,
    "totalProduits": 212,
    "boxe1Mortalite": 3,
    "boxe2Mortalite": 3,
    "totalMortalite": 6,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7449
  },
  {
    "id": "prod_183",
    "excelRow": 183,
    "date": "2026-10-15",
    "boxe1Produits": 110,
    "boxe2Produits": 103,
    "totalProduits": 213,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 2,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7446
  },
  {
    "id": "prod_184",
    "excelRow": 184,
    "date": "2026-10-16",
    "boxe1Produits": 109,
    "boxe2Produits": 102,
    "totalProduits": 211,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 0,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7445
  },
  {
    "id": "prod_185",
    "excelRow": 185,
    "date": "2026-10-17",
    "boxe1Produits": 108,
    "boxe2Produits": 101,
    "totalProduits": 209,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 3,
    "totalMortalite": 4,
    "tablettesVendues": 550,
    "consoAliment": 16,
    "restantVivant": 7441
  },
  {
    "id": "prod_186",
    "excelRow": 186,
    "date": "2026-10-18",
    "boxe1Produits": 105,
    "boxe2Produits": 96,
    "totalProduits": 201,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7440
  },
  {
    "id": "prod_187",
    "excelRow": 187,
    "date": "2026-10-19",
    "boxe1Produits": 106,
    "boxe2Produits": 98,
    "totalProduits": 204,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 3,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7437
  },
  {
    "id": "prod_188",
    "excelRow": 188,
    "date": "2026-10-20",
    "boxe1Produits": 102,
    "boxe2Produits": 98,
    "totalProduits": 200,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 1,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7436
  },
  {
    "id": "prod_189",
    "excelRow": 189,
    "date": "2026-10-21",
    "boxe1Produits": 100,
    "boxe2Produits": 93,
    "totalProduits": 193,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 0,
    "totalMortalite": 1,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7435
  },
  {
    "id": "prod_190",
    "excelRow": 190,
    "date": "2026-10-22",
    "boxe1Produits": 95,
    "boxe2Produits": 93,
    "totalProduits": 188,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 1,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7432
  },
  {
    "id": "prod_191",
    "excelRow": 191,
    "date": "2026-10-23",
    "boxe1Produits": 100,
    "boxe2Produits": 91,
    "totalProduits": 191,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 5,
    "totalMortalite": 6,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7426
  },
  {
    "id": "prod_192",
    "excelRow": 192,
    "date": "2026-10-24",
    "boxe1Produits": 101,
    "boxe2Produits": 90,
    "totalProduits": 191,
    "boxe1Mortalite": 3,
    "boxe2Mortalite": 2,
    "totalMortalite": 5,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7421
  },
  {
    "id": "prod_193",
    "excelRow": 193,
    "date": "2026-10-25",
    "boxe1Produits": 96,
    "boxe2Produits": 88,
    "totalProduits": 184,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 5,
    "totalMortalite": 7,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7414
  },
  {
    "id": "prod_194",
    "excelRow": 194,
    "date": "2026-10-26",
    "boxe1Produits": 103,
    "boxe2Produits": 92,
    "totalProduits": 195,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 15,
    "consoAliment": 16,
    "restantVivant": 7412
  },
  {
    "id": "prod_195",
    "excelRow": 195,
    "date": "2026-10-27",
    "boxe1Produits": 99,
    "boxe2Produits": 94,
    "totalProduits": 193,
    "boxe1Mortalite": 3,
    "boxe2Mortalite": 3,
    "totalMortalite": 6,
    "tablettesVendues": 550,
    "consoAliment": 16,
    "restantVivant": 7406
  },
  {
    "id": "prod_196",
    "excelRow": 196,
    "date": "2026-10-28",
    "boxe1Produits": 99,
    "boxe2Produits": 86,
    "totalProduits": 185,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 3,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7403
  },
  {
    "id": "prod_197",
    "excelRow": 197,
    "date": "2026-10-29",
    "boxe1Produits": 104,
    "boxe2Produits": 93,
    "totalProduits": 197,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 1600,
    "consoAliment": 16,
    "restantVivant": 7401
  },
  {
    "id": "prod_198",
    "excelRow": 198,
    "date": "2026-10-30",
    "boxe1Produits": 100,
    "boxe2Produits": 86,
    "totalProduits": 186,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 0,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7399
  },
  {
    "id": "prod_199",
    "excelRow": 199,
    "date": "2026-10-31",
    "boxe1Produits": 97,
    "boxe2Produits": 87,
    "totalProduits": 184,
    "boxe1Mortalite": 3,
    "boxe2Mortalite": 4,
    "totalMortalite": 7,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7392
  },
  {
    "id": "prod_200",
    "excelRow": 200,
    "date": "2026-11-01",
    "boxe1Produits": 96,
    "boxe2Produits": 87,
    "totalProduits": 183,
    "boxe1Mortalite": 2,
    "boxe2Mortalite": 1,
    "totalMortalite": 3,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7389
  },
  {
    "id": "prod_201",
    "excelRow": 201,
    "date": "2026-11-02",
    "boxe1Produits": 93,
    "boxe2Produits": 88,
    "totalProduits": 181,
    "boxe1Mortalite": 0,
    "boxe2Mortalite": 2,
    "totalMortalite": 2,
    "tablettesVendues": 0,
    "consoAliment": 16,
    "restantVivant": 7387
  },
  {
    "id": "prod_202",
    "excelRow": 202,
    "date": "2026-11-03",
    "boxe1Produits": 100,
    "boxe2Produits": 92,
    "totalProduits": 192,
    "boxe1Mortalite": 1,
    "boxe2Mortalite": 1,
    "totalMortalite": 2,
    "tablettesVendues": 15,
    "consoAliment": 16,
    "restantVivant": 7385
  }
];

export const INITIAL_STOCKAGE_ALIMENT = [
  {
    "id": "alim_3",
    "excelRow": 3,
    "date": "2026-03-23",
    "entrees": 12,
    "sorties": 0,
    "stockRestant": 12
  },
  {
    "id": "alim_4",
    "excelRow": 4,
    "date": "2026-03-19",
    "entrees": 4,
    "sorties": 0,
    "stockRestant": 16
  },
  {
    "id": "alim_5",
    "excelRow": 5,
    "date": "2026-03-25",
    "entrees": 8,
    "sorties": 0,
    "stockRestant": 24
  },
  {
    "id": "alim_6",
    "excelRow": 6,
    "date": "2026-03-26",
    "entrees": 6,
    "sorties": 0,
    "stockRestant": 30
  },
  {
    "id": "alim_10",
    "excelRow": 10,
    "date": "2026-04-17",
    "entrees": 0,
    "sorties": 0,
    "stockRestant": 31
  },
  {
    "id": "alim_19",
    "excelRow": 19,
    "date": "2026-04-26",
    "entrees": 207,
    "sorties": 12,
    "stockRestant": 195
  },
  {
    "id": "alim_20",
    "excelRow": 20,
    "date": "2026-04-27",
    "entrees": 0,
    "sorties": 12,
    "stockRestant": 183
  },
  {
    "id": "alim_21",
    "excelRow": 21,
    "date": "2026-04-28",
    "entrees": 0,
    "sorties": 12,
    "stockRestant": 171
  },
  {
    "id": "alim_22",
    "excelRow": 22,
    "date": "2026-04-29",
    "entrees": 0,
    "sorties": 12,
    "stockRestant": 159
  },
  {
    "id": "alim_23",
    "excelRow": 23,
    "date": "2026-04-30",
    "entrees": 0,
    "sorties": 12,
    "stockRestant": 147
  },
  {
    "id": "alim_24",
    "excelRow": 24,
    "date": "2026-05-01",
    "entrees": 0,
    "sorties": 12,
    "stockRestant": 135
  },
  {
    "id": "alim_25",
    "excelRow": 25,
    "date": "2026-05-02",
    "entrees": 0,
    "sorties": 15,
    "stockRestant": 120
  },
  {
    "id": "alim_26",
    "excelRow": 26,
    "date": "2026-05-03",
    "entrees": 0,
    "sorties": 15,
    "stockRestant": 105
  },
  {
    "id": "alim_27",
    "excelRow": 27,
    "date": "2026-05-04",
    "entrees": 0,
    "sorties": 15,
    "stockRestant": 90
  },
  {
    "id": "alim_28",
    "excelRow": 28,
    "date": "2026-05-05",
    "entrees": 0,
    "sorties": 15,
    "stockRestant": 75
  },
  {
    "id": "alim_29",
    "excelRow": 29,
    "date": "2026-05-06",
    "entrees": 0,
    "sorties": 15,
    "stockRestant": 60
  },
  {
    "id": "alim_30",
    "excelRow": 30,
    "date": "2026-05-07",
    "entrees": 0,
    "sorties": 15,
    "stockRestant": 45
  },
  {
    "id": "alim_31",
    "excelRow": 31,
    "date": "2026-05-08",
    "entrees": 0,
    "sorties": 15,
    "stockRestant": 30
  },
  {
    "id": "alim_32",
    "excelRow": 32,
    "date": "2026-05-09",
    "entrees": 225,
    "sorties": 16,
    "stockRestant": 239
  },
  {
    "id": "alim_33",
    "excelRow": 33,
    "date": "2026-05-10",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 223
  },
  {
    "id": "alim_34",
    "excelRow": 34,
    "date": "2026-05-11",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 207
  },
  {
    "id": "alim_35",
    "excelRow": 35,
    "date": "2026-05-12",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 191
  },
  {
    "id": "alim_36",
    "excelRow": 36,
    "date": "2026-05-13",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 175
  },
  {
    "id": "alim_37",
    "excelRow": 37,
    "date": "2026-05-14",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 159
  },
  {
    "id": "alim_38",
    "excelRow": 38,
    "date": "2026-05-15",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 143
  },
  {
    "id": "alim_39",
    "excelRow": 39,
    "date": "2026-05-16",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 127
  },
  {
    "id": "alim_40",
    "excelRow": 40,
    "date": "2026-05-17",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 111
  },
  {
    "id": "alim_41",
    "excelRow": 41,
    "date": "2026-05-18",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 95
  },
  {
    "id": "alim_42",
    "excelRow": 42,
    "date": "2026-05-19",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 79
  },
  {
    "id": "alim_43",
    "excelRow": 43,
    "date": "2026-05-20",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 63
  },
  {
    "id": "alim_44",
    "excelRow": 44,
    "date": "2026-05-21",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 47
  },
  {
    "id": "alim_45",
    "excelRow": 45,
    "date": "2026-05-22",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 31
  },
  {
    "id": "alim_46",
    "excelRow": 46,
    "date": "2026-05-23",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 15
  },
  {
    "id": "alim_47",
    "excelRow": 47,
    "date": "2026-05-24",
    "entrees": 232,
    "sorties": 16,
    "stockRestant": 231
  },
  {
    "id": "alim_48",
    "excelRow": 48,
    "date": "2026-05-25",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 215
  },
  {
    "id": "alim_49",
    "excelRow": 49,
    "date": "2026-05-26",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 199
  },
  {
    "id": "alim_50",
    "excelRow": 50,
    "date": "2026-05-27",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 183
  },
  {
    "id": "alim_51",
    "excelRow": 51,
    "date": "2026-05-28",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 167
  },
  {
    "id": "alim_52",
    "excelRow": 52,
    "date": "2026-05-29",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 151
  },
  {
    "id": "alim_53",
    "excelRow": 53,
    "date": "2026-05-30",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 135
  },
  {
    "id": "alim_54",
    "excelRow": 54,
    "date": "2026-05-31",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 119
  },
  {
    "id": "alim_55",
    "excelRow": 55,
    "date": "2026-06-01",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 103
  },
  {
    "id": "alim_56",
    "excelRow": 56,
    "date": "2026-06-02",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 87
  },
  {
    "id": "alim_57",
    "excelRow": 57,
    "date": "2026-06-03",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 71
  },
  {
    "id": "alim_58",
    "excelRow": 58,
    "date": "2026-06-04",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 55
  },
  {
    "id": "alim_59",
    "excelRow": 59,
    "date": "2026-06-05",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 39
  },
  {
    "id": "alim_60",
    "excelRow": 60,
    "date": "2026-06-06",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 23
  },
  {
    "id": "alim_61",
    "excelRow": 61,
    "date": "2026-06-07",
    "entrees": 240,
    "sorties": 16,
    "stockRestant": 247
  },
  {
    "id": "alim_62",
    "excelRow": 62,
    "date": "2026-06-08",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 231
  },
  {
    "id": "alim_63",
    "excelRow": 63,
    "date": "2026-06-09",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 215
  },
  {
    "id": "alim_64",
    "excelRow": 64,
    "date": "2026-06-10",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 199
  },
  {
    "id": "alim_65",
    "excelRow": 65,
    "date": "2026-06-11",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 183
  },
  {
    "id": "alim_66",
    "excelRow": 66,
    "date": "2026-06-12",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 167
  },
  {
    "id": "alim_67",
    "excelRow": 67,
    "date": "2026-06-13",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 151
  },
  {
    "id": "alim_68",
    "excelRow": 68,
    "date": "2026-06-14",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 135
  },
  {
    "id": "alim_69",
    "excelRow": 69,
    "date": "2026-06-15",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 119
  },
  {
    "id": "alim_70",
    "excelRow": 70,
    "date": "2026-06-16",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 103
  },
  {
    "id": "alim_71",
    "excelRow": 71,
    "date": "2026-06-17",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 87
  },
  {
    "id": "alim_72",
    "excelRow": 72,
    "date": "2026-06-18",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 71
  },
  {
    "id": "alim_73",
    "excelRow": 73,
    "date": "2026-06-19",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 55
  },
  {
    "id": "alim_74",
    "excelRow": 74,
    "date": "2026-06-20",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 39
  },
  {
    "id": "alim_75",
    "excelRow": 75,
    "date": "2026-06-21",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 23
  },
  {
    "id": "alim_76",
    "excelRow": 76,
    "date": "2026-06-22",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 7
  },
  {
    "id": "alim_77",
    "excelRow": 77,
    "date": "2026-06-23",
    "entrees": 204,
    "sorties": 16,
    "stockRestant": 195
  },
  {
    "id": "alim_78",
    "excelRow": 78,
    "date": "2026-06-24",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 179
  },
  {
    "id": "alim_79",
    "excelRow": 79,
    "date": "2026-06-25",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 163
  },
  {
    "id": "alim_80",
    "excelRow": 80,
    "date": "2026-06-26",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 147
  },
  {
    "id": "alim_81",
    "excelRow": 81,
    "date": "2026-06-27",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 131
  },
  {
    "id": "alim_82",
    "excelRow": 82,
    "date": "2026-06-28",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 115
  },
  {
    "id": "alim_83",
    "excelRow": 83,
    "date": "2026-06-29",
    "entrees": 110,
    "sorties": 16,
    "stockRestant": 209
  },
  {
    "id": "alim_84",
    "excelRow": 84,
    "date": "2026-06-30",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 193
  },
  {
    "id": "alim_85",
    "excelRow": 85,
    "date": "2026-07-01",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 177
  },
  {
    "id": "alim_86",
    "excelRow": 86,
    "date": "2026-07-02",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 161
  },
  {
    "id": "alim_87",
    "excelRow": 87,
    "date": "2026-07-03",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 145
  },
  {
    "id": "alim_88",
    "excelRow": 88,
    "date": "2026-07-04",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 129
  },
  {
    "id": "alim_89",
    "excelRow": 89,
    "date": "2026-07-05",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 113
  },
  {
    "id": "alim_90",
    "excelRow": 90,
    "date": "2026-07-06",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 97
  },
  {
    "id": "alim_91",
    "excelRow": 91,
    "date": "2026-07-07",
    "entrees": 16,
    "sorties": 16,
    "stockRestant": 97
  },
  {
    "id": "alim_92",
    "excelRow": 92,
    "date": "2026-07-08",
    "entrees": 60,
    "sorties": 16,
    "stockRestant": 141
  },
  {
    "id": "alim_93",
    "excelRow": 93,
    "date": "2026-07-09",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 125
  },
  {
    "id": "alim_94",
    "excelRow": 94,
    "date": "2026-07-10",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 109
  },
  {
    "id": "alim_95",
    "excelRow": 95,
    "date": "2026-07-11",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 93
  },
  {
    "id": "alim_96",
    "excelRow": 96,
    "date": "2026-07-12",
    "entrees": 175,
    "sorties": 16,
    "stockRestant": 252
  },
  {
    "id": "alim_97",
    "excelRow": 97,
    "date": "2026-07-13",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 236
  },
  {
    "id": "alim_98",
    "excelRow": 98,
    "date": "2026-07-14",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 220
  },
  {
    "id": "alim_99",
    "excelRow": 99,
    "date": "2026-07-15",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 204
  },
  {
    "id": "alim_100",
    "excelRow": 100,
    "date": "2026-07-16",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 188
  },
  {
    "id": "alim_101",
    "excelRow": 101,
    "date": "2026-07-17",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 172
  },
  {
    "id": "alim_102",
    "excelRow": 102,
    "date": "2026-07-18",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 156
  },
  {
    "id": "alim_103",
    "excelRow": 103,
    "date": "2026-07-19",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 140
  },
  {
    "id": "alim_104",
    "excelRow": 104,
    "date": "2026-07-20",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 124
  },
  {
    "id": "alim_105",
    "excelRow": 105,
    "date": "2026-07-21",
    "entrees": 130,
    "sorties": 16,
    "stockRestant": 238
  },
  {
    "id": "alim_106",
    "excelRow": 106,
    "date": "2026-07-22",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 222
  },
  {
    "id": "alim_107",
    "excelRow": 107,
    "date": "2026-07-23",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 206
  },
  {
    "id": "alim_108",
    "excelRow": 108,
    "date": "2026-07-24",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 190
  },
  {
    "id": "alim_109",
    "excelRow": 109,
    "date": "2026-07-25",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 174
  },
  {
    "id": "alim_110",
    "excelRow": 110,
    "date": "2026-07-26",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 158
  },
  {
    "id": "alim_111",
    "excelRow": 111,
    "date": "2026-07-27",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 142
  },
  {
    "id": "alim_112",
    "excelRow": 112,
    "date": "2026-07-28",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 126
  },
  {
    "id": "alim_113",
    "excelRow": 113,
    "date": "2026-07-29",
    "entrees": 66,
    "sorties": 16,
    "stockRestant": 176
  },
  {
    "id": "alim_114",
    "excelRow": 114,
    "date": "2026-07-30",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 160
  },
  {
    "id": "alim_115",
    "excelRow": 115,
    "date": "2026-07-31",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 144
  },
  {
    "id": "alim_116",
    "excelRow": 116,
    "date": "2026-08-01",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 128
  },
  {
    "id": "alim_117",
    "excelRow": 117,
    "date": "2026-08-02",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 112
  },
  {
    "id": "alim_118",
    "excelRow": 118,
    "date": "2026-08-03",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 96
  },
  {
    "id": "alim_119",
    "excelRow": 119,
    "date": "2026-08-04",
    "entrees": 0,
    "sorties": 26,
    "stockRestant": 70
  },
  {
    "id": "alim_120",
    "excelRow": 120,
    "date": "2026-08-05",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 54
  },
  {
    "id": "alim_121",
    "excelRow": 121,
    "date": "2026-08-06",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 38
  },
  {
    "id": "alim_122",
    "excelRow": 122,
    "date": "2026-08-07",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 22
  },
  {
    "id": "alim_123",
    "excelRow": 123,
    "date": "2026-08-08",
    "entrees": 338,
    "sorties": 16,
    "stockRestant": 344
  },
  {
    "id": "alim_124",
    "excelRow": 124,
    "date": "2026-08-09",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 328
  },
  {
    "id": "alim_125",
    "excelRow": 125,
    "date": "2026-08-10",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 312
  },
  {
    "id": "alim_126",
    "excelRow": 126,
    "date": "2026-08-11",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 296
  },
  {
    "id": "alim_127",
    "excelRow": 127,
    "date": "2026-08-12",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 280
  },
  {
    "id": "alim_128",
    "excelRow": 128,
    "date": "2026-08-13",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 264
  },
  {
    "id": "alim_129",
    "excelRow": 129,
    "date": "2026-08-14",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 248
  },
  {
    "id": "alim_130",
    "excelRow": 130,
    "date": "2026-08-15",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 232
  },
  {
    "id": "alim_131",
    "excelRow": 131,
    "date": "2026-08-16",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 216
  },
  {
    "id": "alim_132",
    "excelRow": 132,
    "date": "2026-08-17",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 200
  },
  {
    "id": "alim_133",
    "excelRow": 133,
    "date": "2026-08-18",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 212
  },
  {
    "id": "alim_134",
    "excelRow": 134,
    "date": "2026-08-19",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 196
  },
  {
    "id": "alim_135",
    "excelRow": 135,
    "date": "2026-08-20",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 180
  },
  {
    "id": "alim_136",
    "excelRow": 136,
    "date": "2026-08-21",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 164
  },
  {
    "id": "alim_137",
    "excelRow": 137,
    "date": "2026-08-22",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 148
  },
  {
    "id": "alim_138",
    "excelRow": 138,
    "date": "2026-08-23",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 132
  },
  {
    "id": "alim_139",
    "excelRow": 139,
    "date": "2026-08-24",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 116
  },
  {
    "id": "alim_140",
    "excelRow": 140,
    "date": "2026-08-25",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 100
  },
  {
    "id": "alim_141",
    "excelRow": 141,
    "date": "2026-08-26",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 84
  },
  {
    "id": "alim_142",
    "excelRow": 142,
    "date": "2026-08-27",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 68
  },
  {
    "id": "alim_143",
    "excelRow": 143,
    "date": "2026-08-28",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 52
  },
  {
    "id": "alim_144",
    "excelRow": 144,
    "date": "2026-08-29",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 36
  },
  {
    "id": "alim_145",
    "excelRow": 145,
    "date": "2026-08-30",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 20
  },
  {
    "id": "alim_146",
    "excelRow": 146,
    "date": "2026-08-31",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 4
  },
  {
    "id": "alim_147",
    "excelRow": 147,
    "date": "2026-09-01",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 10
  },
  {
    "id": "alim_148",
    "excelRow": 148,
    "date": "2026-09-02",
    "entrees": 0,
    "sorties": 10,
    "stockRestant": 0
  },
  {
    "id": "alim_150",
    "excelRow": 150,
    "date": "2026-09-04",
    "entrees": 200,
    "sorties": 16,
    "stockRestant": 184
  },
  {
    "id": "alim_151",
    "excelRow": 151,
    "date": "2026-09-05",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 168
  },
  {
    "id": "alim_152",
    "excelRow": 152,
    "date": "2026-09-06",
    "entrees": 188,
    "sorties": 16,
    "stockRestant": 340
  },
  {
    "id": "alim_153",
    "excelRow": 153,
    "date": "2026-09-07",
    "entrees": 0,
    "sorties": 15,
    "stockRestant": 325
  },
  {
    "id": "alim_154",
    "excelRow": 154,
    "date": "2026-09-08",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 311
  },
  {
    "id": "alim_155",
    "excelRow": 155,
    "date": "2026-09-09",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 297
  },
  {
    "id": "alim_156",
    "excelRow": 156,
    "date": "2026-09-10",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 283
  },
  {
    "id": "alim_157",
    "excelRow": 157,
    "date": "2026-09-11",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 269
  },
  {
    "id": "alim_158",
    "excelRow": 158,
    "date": "2026-09-12",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 255
  },
  {
    "id": "alim_159",
    "excelRow": 159,
    "date": "2026-09-13",
    "entrees": 0,
    "sorties": 10,
    "stockRestant": 245
  },
  {
    "id": "alim_160",
    "excelRow": 160,
    "date": "2026-09-14",
    "entrees": 0,
    "sorties": 12,
    "stockRestant": 233
  },
  {
    "id": "alim_161",
    "excelRow": 161,
    "date": "2026-09-15",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 219
  },
  {
    "id": "alim_162",
    "excelRow": 162,
    "date": "2026-09-16",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 205
  },
  {
    "id": "alim_163",
    "excelRow": 163,
    "date": "2026-09-17",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 191
  },
  {
    "id": "alim_164",
    "excelRow": 164,
    "date": "2026-09-18",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 177
  },
  {
    "id": "alim_165",
    "excelRow": 165,
    "date": "2026-09-19",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 163
  },
  {
    "id": "alim_166",
    "excelRow": 166,
    "date": "2026-09-20",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 149
  },
  {
    "id": "alim_167",
    "excelRow": 167,
    "date": "2026-09-21",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 135
  },
  {
    "id": "alim_168",
    "excelRow": 168,
    "date": "2026-09-22",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 121
  },
  {
    "id": "alim_169",
    "excelRow": 169,
    "date": "2026-09-23",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 107
  },
  {
    "id": "alim_170",
    "excelRow": 170,
    "date": "2026-09-24",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 93
  },
  {
    "id": "alim_171",
    "excelRow": 171,
    "date": "2026-09-25",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 79
  },
  {
    "id": "alim_172",
    "excelRow": 172,
    "date": "2026-09-26",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 65
  },
  {
    "id": "alim_173",
    "excelRow": 173,
    "date": "2026-09-27",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 51
  },
  {
    "id": "alim_174",
    "excelRow": 174,
    "date": "2026-09-28",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 37
  },
  {
    "id": "alim_175",
    "excelRow": 175,
    "date": "2026-09-29",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 23
  },
  {
    "id": "alim_176",
    "excelRow": 176,
    "date": "2026-09-30",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 9
  },
  {
    "id": "alim_177",
    "excelRow": 177,
    "date": "2026-10-01",
    "entrees": 20,
    "sorties": 14,
    "stockRestant": 15
  },
  {
    "id": "alim_178",
    "excelRow": 178,
    "date": "2026-10-02",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 1
  },
  {
    "id": "alim_179",
    "excelRow": 179,
    "date": "2026-10-03",
    "entrees": 200,
    "sorties": 8,
    "stockRestant": 193
  },
  {
    "id": "alim_180",
    "excelRow": 180,
    "date": "2026-10-04",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 179
  },
  {
    "id": "alim_181",
    "excelRow": 181,
    "date": "2026-10-05",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 165
  },
  {
    "id": "alim_182",
    "excelRow": 182,
    "date": "2026-10-06",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 151
  },
  {
    "id": "alim_183",
    "excelRow": 183,
    "date": "2026-10-07",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 146
  },
  {
    "id": "alim_184",
    "excelRow": 184,
    "date": "2026-10-08",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 132
  },
  {
    "id": "alim_185",
    "excelRow": 185,
    "date": "2026-10-09",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 118
  },
  {
    "id": "alim_186",
    "excelRow": 186,
    "date": "2026-10-10",
    "entrees": 0,
    "sorties": 14,
    "stockRestant": 104
  },
  {
    "id": "alim_187",
    "excelRow": 187,
    "date": "2026-10-11",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 88
  },
  {
    "id": "alim_188",
    "excelRow": 188,
    "date": "2026-10-12",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 72
  },
  {
    "id": "alim_189",
    "excelRow": 189,
    "date": "2026-10-13",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 56
  },
  {
    "id": "alim_190",
    "excelRow": 190,
    "date": "2026-10-14",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 40
  },
  {
    "id": "alim_191",
    "excelRow": 191,
    "date": "2026-10-15",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 24
  },
  {
    "id": "alim_192",
    "excelRow": 192,
    "date": "2026-10-16",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 8
  },
  {
    "id": "alim_193",
    "excelRow": 193,
    "date": "2026-10-17",
    "entrees": 200,
    "sorties": 16,
    "stockRestant": 192
  },
  {
    "id": "alim_194",
    "excelRow": 194,
    "date": "2026-10-18",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 176
  },
  {
    "id": "alim_195",
    "excelRow": 195,
    "date": "2026-10-19",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 160
  },
  {
    "id": "alim_196",
    "excelRow": 196,
    "date": "2026-10-20",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 144
  },
  {
    "id": "alim_197",
    "excelRow": 197,
    "date": "2026-10-21",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 128
  },
  {
    "id": "alim_198",
    "excelRow": 198,
    "date": "2026-10-22",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 112
  },
  {
    "id": "alim_199",
    "excelRow": 199,
    "date": "2026-10-23",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 96
  },
  {
    "id": "alim_200",
    "excelRow": 200,
    "date": "2026-10-24",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 80
  },
  {
    "id": "alim_201",
    "excelRow": 201,
    "date": "2026-10-25",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 64
  },
  {
    "id": "alim_202",
    "excelRow": 202,
    "date": "2026-10-26",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 48
  },
  {
    "id": "alim_203",
    "excelRow": 203,
    "date": "2026-10-27",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 32
  },
  {
    "id": "alim_204",
    "excelRow": 204,
    "date": "2026-10-28",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 16
  },
  {
    "id": "alim_205",
    "excelRow": 205,
    "date": "2026-10-29",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 0
  },
  {
    "id": "alim_206",
    "excelRow": 206,
    "date": "2026-10-30",
    "entrees": 200,
    "sorties": 16,
    "stockRestant": 184
  },
  {
    "id": "alim_207",
    "excelRow": 207,
    "date": "2026-10-31",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 168
  },
  {
    "id": "alim_208",
    "excelRow": 208,
    "date": "2026-11-01",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 152
  },
  {
    "id": "alim_209",
    "excelRow": 209,
    "date": "2026-11-02",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 136
  },
  {
    "id": "alim_210",
    "excelRow": 210,
    "date": "2026-11-03",
    "entrees": 0,
    "sorties": 16,
    "stockRestant": 120
  }
];

export const INITIAL_STOCKAGE_OEUFS = [
  {
    "id": "oeuf_3",
    "excelRow": 3,
    "date": "2026-04-17",
    "entrees": 28,
    "sorties": 0,
    "stockRestant": 28
  },
  {
    "id": "oeuf_4",
    "excelRow": 4,
    "date": "2026-04-18",
    "entrees": 36,
    "sorties": 0,
    "stockRestant": 64
  },
  {
    "id": "oeuf_5",
    "excelRow": 5,
    "date": "2026-04-19",
    "entrees": 56,
    "sorties": 0,
    "stockRestant": 120
  },
  {
    "id": "oeuf_6",
    "excelRow": 6,
    "date": "2026-04-20",
    "entrees": 74,
    "sorties": 0,
    "stockRestant": 194
  },
  {
    "id": "oeuf_7",
    "excelRow": 7,
    "date": "2026-04-21",
    "entrees": 85,
    "sorties": 0,
    "stockRestant": 279
  },
  {
    "id": "oeuf_8",
    "excelRow": 8,
    "date": "2026-04-22",
    "entrees": 89,
    "sorties": 300,
    "stockRestant": 68
  },
  {
    "id": "oeuf_9",
    "excelRow": 9,
    "date": "2026-04-23",
    "entrees": 119,
    "sorties": 0,
    "stockRestant": 187
  },
  {
    "id": "oeuf_10",
    "excelRow": 10,
    "date": "2026-04-24",
    "entrees": 136,
    "sorties": 0,
    "stockRestant": 323
  },
  {
    "id": "oeuf_11",
    "excelRow": 11,
    "date": "2026-04-25",
    "entrees": 146,
    "sorties": 0,
    "stockRestant": 469
  },
  {
    "id": "oeuf_12",
    "excelRow": 12,
    "date": "2026-04-26",
    "entrees": 157,
    "sorties": 50,
    "stockRestant": 576
  },
  {
    "id": "oeuf_13",
    "excelRow": 13,
    "date": "2026-04-27",
    "entrees": 162,
    "sorties": 0,
    "stockRestant": 738
  },
  {
    "id": "oeuf_14",
    "excelRow": 14,
    "date": "2026-04-28",
    "entrees": 169,
    "sorties": 600,
    "stockRestant": 307
  },
  {
    "id": "oeuf_15",
    "excelRow": 15,
    "date": "2026-04-29",
    "entrees": 171,
    "sorties": 0,
    "stockRestant": 478
  },
  {
    "id": "oeuf_16",
    "excelRow": 16,
    "date": "2026-04-30",
    "entrees": 177,
    "sorties": 0,
    "stockRestant": 655
  },
  {
    "id": "oeuf_17",
    "excelRow": 17,
    "date": "2026-05-01",
    "entrees": 163,
    "sorties": 0,
    "stockRestant": 818
  },
  {
    "id": "oeuf_18",
    "excelRow": 18,
    "date": "2026-05-02",
    "entrees": 167,
    "sorties": 948,
    "stockRestant": 37
  },
  {
    "id": "oeuf_19",
    "excelRow": 19,
    "date": "2026-05-03",
    "entrees": 168,
    "sorties": 0,
    "stockRestant": 205
  },
  {
    "id": "oeuf_20",
    "excelRow": 20,
    "date": "2026-05-04",
    "entrees": 166,
    "sorties": 0,
    "stockRestant": 371
  },
  {
    "id": "oeuf_21",
    "excelRow": 21,
    "date": "2026-05-05",
    "entrees": 170,
    "sorties": 0,
    "stockRestant": 541
  },
  {
    "id": "oeuf_22",
    "excelRow": 22,
    "date": "2026-05-06",
    "entrees": 173,
    "sorties": 0,
    "stockRestant": 714
  },
  {
    "id": "oeuf_23",
    "excelRow": 23,
    "date": "2026-05-07",
    "entrees": 178,
    "sorties": 100,
    "stockRestant": 792
  },
  {
    "id": "oeuf_24",
    "excelRow": 24,
    "date": "2026-05-08",
    "entrees": 170,
    "sorties": 0,
    "stockRestant": 962
  },
  {
    "id": "oeuf_25",
    "excelRow": 25,
    "date": "2026-05-09",
    "entrees": 177,
    "sorties": 1100,
    "stockRestant": 39
  },
  {
    "id": "oeuf_26",
    "excelRow": 26,
    "date": "2026-05-10",
    "entrees": 179,
    "sorties": 0,
    "stockRestant": 218
  },
  {
    "id": "oeuf_27",
    "excelRow": 27,
    "date": "2026-05-11",
    "entrees": 180,
    "sorties": 0,
    "stockRestant": 398
  },
  {
    "id": "oeuf_28",
    "excelRow": 28,
    "date": "2026-05-12",
    "entrees": 183,
    "sorties": 500,
    "stockRestant": 81
  },
  {
    "id": "oeuf_29",
    "excelRow": 29,
    "date": "2026-05-13",
    "entrees": 183,
    "sorties": 0,
    "stockRestant": 264
  },
  {
    "id": "oeuf_30",
    "excelRow": 30,
    "date": "2026-05-14",
    "entrees": 184,
    "sorties": 100,
    "stockRestant": 348
  },
  {
    "id": "oeuf_31",
    "excelRow": 31,
    "date": "2026-05-15",
    "entrees": 183,
    "sorties": 0,
    "stockRestant": 531
  },
  {
    "id": "oeuf_32",
    "excelRow": 32,
    "date": "2026-05-16",
    "entrees": 189,
    "sorties": 685,
    "stockRestant": 35
  },
  {
    "id": "oeuf_33",
    "excelRow": 33,
    "date": "2026-05-17",
    "entrees": 188,
    "sorties": 0,
    "stockRestant": 223
  },
  {
    "id": "oeuf_34",
    "excelRow": 34,
    "date": "2026-05-18",
    "entrees": 187,
    "sorties": 0,
    "stockRestant": 410
  },
  {
    "id": "oeuf_35",
    "excelRow": 35,
    "date": "2026-05-19",
    "entrees": 191,
    "sorties": 11,
    "stockRestant": 590
  },
  {
    "id": "oeuf_36",
    "excelRow": 36,
    "date": "2026-05-20",
    "entrees": 192,
    "sorties": 500,
    "stockRestant": 282
  },
  {
    "id": "oeuf_37",
    "excelRow": 37,
    "date": "2026-05-21",
    "entrees": 192,
    "sorties": 0,
    "stockRestant": 474
  },
  {
    "id": "oeuf_38",
    "excelRow": 38,
    "date": "2026-05-22",
    "entrees": 192,
    "sorties": 0,
    "stockRestant": 666
  },
  {
    "id": "oeuf_39",
    "excelRow": 39,
    "date": "2026-05-23",
    "entrees": 192,
    "sorties": 0,
    "stockRestant": 858
  },
  {
    "id": "oeuf_40",
    "excelRow": 40,
    "date": "2026-05-24",
    "entrees": 195,
    "sorties": 1010,
    "stockRestant": 43
  },
  {
    "id": "oeuf_41",
    "excelRow": 41,
    "date": "2026-05-25",
    "entrees": 193,
    "sorties": 0,
    "stockRestant": 236
  },
  {
    "id": "oeuf_42",
    "excelRow": 42,
    "date": "2026-05-26",
    "entrees": 197,
    "sorties": 0,
    "stockRestant": 433
  },
  {
    "id": "oeuf_43",
    "excelRow": 43,
    "date": "2026-05-27",
    "entrees": 198,
    "sorties": 0,
    "stockRestant": 631
  },
  {
    "id": "oeuf_44",
    "excelRow": 44,
    "date": "2026-05-28",
    "entrees": 198,
    "sorties": 0,
    "stockRestant": 829
  },
  {
    "id": "oeuf_45",
    "excelRow": 45,
    "date": "2026-05-29",
    "entrees": 199,
    "sorties": 100,
    "stockRestant": 928
  },
  {
    "id": "oeuf_46",
    "excelRow": 46,
    "date": "2026-05-30",
    "entrees": 201,
    "sorties": 0,
    "stockRestant": 1129
  },
  {
    "id": "oeuf_47",
    "excelRow": 47,
    "date": "2026-05-31",
    "entrees": 200,
    "sorties": 0,
    "stockRestant": 1329
  },
  {
    "id": "oeuf_48",
    "excelRow": 48,
    "date": "2026-06-01",
    "entrees": 201,
    "sorties": 0,
    "stockRestant": 1530
  },
  {
    "id": "oeuf_49",
    "excelRow": 49,
    "date": "2026-06-02",
    "entrees": 207,
    "sorties": 1690,
    "stockRestant": 47
  },
  {
    "id": "oeuf_50",
    "excelRow": 50,
    "date": "2026-06-03",
    "entrees": 210,
    "sorties": 0,
    "stockRestant": 257
  },
  {
    "id": "oeuf_51",
    "excelRow": 51,
    "date": "2026-06-04",
    "entrees": 210,
    "sorties": 0,
    "stockRestant": 467
  },
  {
    "id": "oeuf_52",
    "excelRow": 52,
    "date": "2026-06-05",
    "entrees": 214,
    "sorties": 0,
    "stockRestant": 681
  },
  {
    "id": "oeuf_53",
    "excelRow": 53,
    "date": "2026-06-06",
    "entrees": 214,
    "sorties": 0,
    "stockRestant": 895
  },
  {
    "id": "oeuf_54",
    "excelRow": 54,
    "date": "2026-06-07",
    "entrees": 221,
    "sorties": 0,
    "stockRestant": 1116
  },
  {
    "id": "oeuf_55",
    "excelRow": 55,
    "date": "2026-06-08",
    "entrees": 215,
    "sorties": 0,
    "stockRestant": 1331
  },
  {
    "id": "oeuf_56",
    "excelRow": 56,
    "date": "2026-06-09",
    "entrees": 219,
    "sorties": 0,
    "stockRestant": 1550
  },
  {
    "id": "oeuf_57",
    "excelRow": 57,
    "date": "2026-06-10",
    "entrees": 221,
    "sorties": 0,
    "stockRestant": 1771
  },
  {
    "id": "oeuf_58",
    "excelRow": 58,
    "date": "2026-06-11",
    "entrees": 218,
    "sorties": 0,
    "stockRestant": 1989
  },
  {
    "id": "oeuf_59",
    "excelRow": 59,
    "date": "2026-06-12",
    "entrees": 223,
    "sorties": 0,
    "stockRestant": 2212
  },
  {
    "id": "oeuf_60",
    "excelRow": 60,
    "date": "2026-06-13",
    "entrees": 220,
    "sorties": 1700,
    "stockRestant": 732
  },
  {
    "id": "oeuf_61",
    "excelRow": 61,
    "date": "2026-06-14",
    "entrees": 229,
    "sorties": 0,
    "stockRestant": 961
  },
  {
    "id": "oeuf_62",
    "excelRow": 62,
    "date": "2026-06-15",
    "entrees": 229,
    "sorties": 700,
    "stockRestant": 490
  },
  {
    "id": "oeuf_63",
    "excelRow": 63,
    "date": "2026-06-16",
    "entrees": 223,
    "sorties": 0,
    "stockRestant": 713
  },
  {
    "id": "oeuf_64",
    "excelRow": 64,
    "date": "2026-06-17",
    "entrees": 229,
    "sorties": 0,
    "stockRestant": 942
  },
  {
    "id": "oeuf_65",
    "excelRow": 65,
    "date": "2026-06-18",
    "entrees": 228,
    "sorties": 0,
    "stockRestant": 1170
  },
  {
    "id": "oeuf_66",
    "excelRow": 66,
    "date": "2026-06-19",
    "entrees": 230,
    "sorties": 0,
    "stockRestant": 1400
  },
  {
    "id": "oeuf_67",
    "excelRow": 67,
    "date": "2026-06-20",
    "entrees": 225,
    "sorties": 1500,
    "stockRestant": 125
  },
  {
    "id": "oeuf_68",
    "excelRow": 68,
    "date": "2026-06-21",
    "entrees": 228,
    "sorties": 0,
    "stockRestant": 353
  },
  {
    "id": "oeuf_69",
    "excelRow": 69,
    "date": "2026-06-22",
    "entrees": 228,
    "sorties": 0,
    "stockRestant": 581
  },
  {
    "id": "oeuf_70",
    "excelRow": 70,
    "date": "2026-06-23",
    "entrees": 228,
    "sorties": 0,
    "stockRestant": 809
  },
  {
    "id": "oeuf_71",
    "excelRow": 71,
    "date": "2026-06-24",
    "entrees": 230,
    "sorties": 0,
    "stockRestant": 1039
  },
  {
    "id": "oeuf_72",
    "excelRow": 72,
    "date": "2026-06-25",
    "entrees": 234,
    "sorties": 0,
    "stockRestant": 1273
  },
  {
    "id": "oeuf_73",
    "excelRow": 73,
    "date": "2026-06-26",
    "entrees": 232,
    "sorties": 0,
    "stockRestant": 1505
  },
  {
    "id": "oeuf_74",
    "excelRow": 74,
    "date": "2026-06-27",
    "entrees": 234,
    "sorties": 35,
    "stockRestant": 1704
  },
  {
    "id": "oeuf_75",
    "excelRow": 75,
    "date": "2026-06-28",
    "entrees": 236,
    "sorties": 0,
    "stockRestant": 1940
  },
  {
    "id": "oeuf_76",
    "excelRow": 76,
    "date": "2026-06-29",
    "entrees": 232,
    "sorties": 1650,
    "stockRestant": 522
  },
  {
    "id": "oeuf_77",
    "excelRow": 77,
    "date": "2026-06-30",
    "entrees": 241,
    "sorties": 15,
    "stockRestant": 748
  },
  {
    "id": "oeuf_78",
    "excelRow": 78,
    "date": "2026-07-01",
    "entrees": 240,
    "sorties": 0,
    "stockRestant": 988
  },
  {
    "id": "oeuf_79",
    "excelRow": 79,
    "date": "2026-07-02",
    "entrees": 233,
    "sorties": 15,
    "stockRestant": 1206
  },
  {
    "id": "oeuf_80",
    "excelRow": 80,
    "date": "2026-07-03",
    "entrees": 235,
    "sorties": 0,
    "stockRestant": 1441
  },
  {
    "id": "oeuf_81",
    "excelRow": 81,
    "date": "2026-07-04",
    "entrees": 236,
    "sorties": 0,
    "stockRestant": 1677
  },
  {
    "id": "oeuf_82",
    "excelRow": 82,
    "date": "2026-07-05",
    "entrees": 236,
    "sorties": 0,
    "stockRestant": 1913
  },
  {
    "id": "oeuf_83",
    "excelRow": 83,
    "date": "2026-07-06",
    "entrees": 238,
    "sorties": 0,
    "stockRestant": 2151
  },
  {
    "id": "oeuf_84",
    "excelRow": 84,
    "date": "2026-07-07",
    "entrees": 238,
    "sorties": 1500,
    "stockRestant": 889
  },
  {
    "id": "oeuf_85",
    "excelRow": 85,
    "date": "2026-07-08",
    "entrees": 240,
    "sorties": 30,
    "stockRestant": 1099
  },
  {
    "id": "oeuf_86",
    "excelRow": 86,
    "date": "2026-07-09",
    "entrees": 240,
    "sorties": 20,
    "stockRestant": 1319
  },
  {
    "id": "oeuf_87",
    "excelRow": 87,
    "date": "2026-07-10",
    "entrees": 241,
    "sorties": 0,
    "stockRestant": 1560
  },
  {
    "id": "oeuf_88",
    "excelRow": 88,
    "date": "2026-07-11",
    "entrees": 241,
    "sorties": 0,
    "stockRestant": 1801
  },
  {
    "id": "oeuf_89",
    "excelRow": 89,
    "date": "2026-07-12",
    "entrees": 240,
    "sorties": 0,
    "stockRestant": 2041
  },
  {
    "id": "oeuf_90",
    "excelRow": 90,
    "date": "2026-07-13",
    "entrees": 240,
    "sorties": 0,
    "stockRestant": 2281
  },
  {
    "id": "oeuf_91",
    "excelRow": 91,
    "date": "2026-07-14",
    "entrees": 241,
    "sorties": 2100,
    "stockRestant": 422
  },
  {
    "id": "oeuf_92",
    "excelRow": 92,
    "date": "2026-07-15",
    "entrees": 238,
    "sorties": 0,
    "stockRestant": 660
  },
  {
    "id": "oeuf_93",
    "excelRow": 93,
    "date": "2026-07-16",
    "entrees": 237,
    "sorties": 0,
    "stockRestant": 897
  },
  {
    "id": "oeuf_94",
    "excelRow": 94,
    "date": "2026-07-17",
    "entrees": 238,
    "sorties": 0,
    "stockRestant": 1135
  },
  {
    "id": "oeuf_95",
    "excelRow": 95,
    "date": "2026-07-18",
    "entrees": 240,
    "sorties": 0,
    "stockRestant": 1375
  },
  {
    "id": "oeuf_96",
    "excelRow": 96,
    "date": "2026-07-19",
    "entrees": 240,
    "sorties": 450,
    "stockRestant": 1165
  },
  {
    "id": "oeuf_97",
    "excelRow": 97,
    "date": "2026-07-20",
    "entrees": 241,
    "sorties": 0,
    "stockRestant": 1406
  },
  {
    "id": "oeuf_98",
    "excelRow": 98,
    "date": "2026-07-21",
    "entrees": 237,
    "sorties": 0,
    "stockRestant": 1643
  },
  {
    "id": "oeuf_99",
    "excelRow": 99,
    "date": "2026-07-22",
    "entrees": 238,
    "sorties": 1700,
    "stockRestant": 181
  },
  {
    "id": "oeuf_100",
    "excelRow": 100,
    "date": "2026-07-23",
    "entrees": 240,
    "sorties": 0,
    "stockRestant": 421
  },
  {
    "id": "oeuf_101",
    "excelRow": 101,
    "date": "2026-07-24",
    "entrees": 236,
    "sorties": 0,
    "stockRestant": 657
  },
  {
    "id": "oeuf_102",
    "excelRow": 102,
    "date": "2026-07-25",
    "entrees": 239,
    "sorties": 0,
    "stockRestant": 896
  },
  {
    "id": "oeuf_103",
    "excelRow": 103,
    "date": "2026-07-26",
    "entrees": 238,
    "sorties": 0,
    "stockRestant": 1134
  },
  {
    "id": "oeuf_104",
    "excelRow": 104,
    "date": "2026-07-27",
    "entrees": 240,
    "sorties": 10,
    "stockRestant": 1364
  },
  {
    "id": "oeuf_105",
    "excelRow": 105,
    "date": "2026-07-28",
    "entrees": 238,
    "sorties": 0,
    "stockRestant": 1602
  },
  {
    "id": "oeuf_106",
    "excelRow": 106,
    "date": "2026-07-29",
    "entrees": 236,
    "sorties": 1700,
    "stockRestant": 138
  },
  {
    "id": "oeuf_107",
    "excelRow": 107,
    "date": "2026-07-30",
    "entrees": 240,
    "sorties": 0,
    "stockRestant": 378
  },
  {
    "id": "oeuf_108",
    "excelRow": 108,
    "date": "2026-07-31",
    "entrees": 237,
    "sorties": 0,
    "stockRestant": 615
  },
  {
    "id": "oeuf_109",
    "excelRow": 109,
    "date": "2026-08-01",
    "entrees": 241,
    "sorties": 0,
    "stockRestant": 856
  },
  {
    "id": "oeuf_110",
    "excelRow": 110,
    "date": "2026-08-02",
    "entrees": 242,
    "sorties": 0,
    "stockRestant": 1098
  },
  {
    "id": "oeuf_111",
    "excelRow": 111,
    "date": "2026-08-03",
    "entrees": 239,
    "sorties": 0,
    "stockRestant": 1337
  },
  {
    "id": "oeuf_112",
    "excelRow": 112,
    "date": "2026-08-04",
    "entrees": 240,
    "sorties": 15,
    "stockRestant": 1562
  },
  {
    "id": "oeuf_113",
    "excelRow": 113,
    "date": "2026-08-05",
    "entrees": 242,
    "sorties": 1700,
    "stockRestant": 104
  },
  {
    "id": "oeuf_114",
    "excelRow": 114,
    "date": "2026-08-06",
    "entrees": 240,
    "sorties": 0,
    "stockRestant": 344
  },
  {
    "id": "oeuf_115",
    "excelRow": 115,
    "date": "2026-08-07",
    "entrees": 241,
    "sorties": 0,
    "stockRestant": 585
  },
  {
    "id": "oeuf_116",
    "excelRow": 116,
    "date": "2026-08-08",
    "entrees": 242,
    "sorties": 0,
    "stockRestant": 827
  },
  {
    "id": "oeuf_117",
    "excelRow": 117,
    "date": "2026-08-09",
    "entrees": 241,
    "sorties": 0,
    "stockRestant": 1068
  },
  {
    "id": "oeuf_118",
    "excelRow": 118,
    "date": "2026-08-10",
    "entrees": 237,
    "sorties": 0,
    "stockRestant": 1305
  },
  {
    "id": "oeuf_119",
    "excelRow": 119,
    "date": "2026-08-11",
    "entrees": 240,
    "sorties": 20,
    "stockRestant": 1525
  },
  {
    "id": "oeuf_120",
    "excelRow": 120,
    "date": "2026-08-12",
    "entrees": 240,
    "sorties": 1660,
    "stockRestant": 1
  },
  {
    "id": "oeuf_121",
    "excelRow": 121,
    "date": "2026-08-13",
    "entrees": 239,
    "sorties": 0,
    "stockRestant": 240
  },
  {
    "id": "oeuf_122",
    "excelRow": 122,
    "date": "2026-08-14",
    "entrees": 238,
    "sorties": 0,
    "stockRestant": 478
  },
  {
    "id": "oeuf_123",
    "excelRow": 123,
    "date": "2026-08-15",
    "entrees": 237,
    "sorties": 0,
    "stockRestant": 715
  },
  {
    "id": "oeuf_124",
    "excelRow": 124,
    "date": "2026-08-16",
    "entrees": 243,
    "sorties": 15,
    "stockRestant": 943
  },
  {
    "id": "oeuf_125",
    "excelRow": 125,
    "date": "2026-08-17",
    "entrees": 240,
    "sorties": 600,
    "stockRestant": 583
  },
  {
    "id": "oeuf_126",
    "excelRow": 126,
    "date": "2026-08-18",
    "entrees": 243,
    "sorties": 0,
    "stockRestant": 826
  },
  {
    "id": "oeuf_127",
    "excelRow": 127,
    "date": "2026-08-19",
    "entrees": 244,
    "sorties": 1050,
    "stockRestant": 20
  },
  {
    "id": "oeuf_128",
    "excelRow": 128,
    "date": "2026-08-20",
    "entrees": 238,
    "sorties": 10,
    "stockRestant": 248
  },
  {
    "id": "oeuf_129",
    "excelRow": 129,
    "date": "2026-08-21",
    "entrees": 237,
    "sorties": 0,
    "stockRestant": 485
  },
  {
    "id": "oeuf_130",
    "excelRow": 130,
    "date": "2026-08-22",
    "entrees": 238,
    "sorties": 0,
    "stockRestant": 723
  },
  {
    "id": "oeuf_131",
    "excelRow": 131,
    "date": "2026-08-23",
    "entrees": 240,
    "sorties": 950,
    "stockRestant": 13
  },
  {
    "id": "oeuf_132",
    "excelRow": 132,
    "date": "2026-08-24",
    "entrees": 236,
    "sorties": 0,
    "stockRestant": 249
  },
  {
    "id": "oeuf_133",
    "excelRow": 133,
    "date": "2026-08-25",
    "entrees": 237,
    "sorties": 0,
    "stockRestant": 486
  },
  {
    "id": "oeuf_134",
    "excelRow": 134,
    "date": "2026-08-26",
    "entrees": 234,
    "sorties": 5,
    "stockRestant": 715
  },
  {
    "id": "oeuf_135",
    "excelRow": 135,
    "date": "2026-08-27",
    "entrees": 237,
    "sorties": 0,
    "stockRestant": 952
  },
  {
    "id": "oeuf_136",
    "excelRow": 136,
    "date": "2026-08-28",
    "entrees": 235,
    "sorties": 1130,
    "stockRestant": 57
  },
  {
    "id": "oeuf_137",
    "excelRow": 137,
    "date": "2026-08-29",
    "entrees": 235,
    "sorties": 0,
    "stockRestant": 292
  },
  {
    "id": "oeuf_138",
    "excelRow": 138,
    "date": "2026-08-30",
    "entrees": 236,
    "sorties": 0,
    "stockRestant": 528
  },
  {
    "id": "oeuf_139",
    "excelRow": 139,
    "date": "2026-08-31",
    "entrees": 235,
    "sorties": 0,
    "stockRestant": 763
  },
  {
    "id": "oeuf_140",
    "excelRow": 140,
    "date": "2026-09-01",
    "entrees": 230,
    "sorties": 560,
    "stockRestant": 433
  },
  {
    "id": "oeuf_141",
    "excelRow": 141,
    "date": "2026-09-02",
    "entrees": 232,
    "sorties": 0,
    "stockRestant": 665
  },
  {
    "id": "oeuf_142",
    "excelRow": 142,
    "date": "2026-09-03",
    "entrees": 229,
    "sorties": 0,
    "stockRestant": 894
  },
  {
    "id": "oeuf_143",
    "excelRow": 143,
    "date": "2026-09-04",
    "entrees": 225,
    "sorties": 0,
    "stockRestant": 1119
  },
  {
    "id": "oeuf_144",
    "excelRow": 144,
    "date": "2026-09-05",
    "entrees": 229,
    "sorties": 0,
    "stockRestant": 1348
  },
  {
    "id": "oeuf_145",
    "excelRow": 145,
    "date": "2026-09-06",
    "entrees": 225,
    "sorties": 1500,
    "stockRestant": 73
  },
  {
    "id": "oeuf_146",
    "excelRow": 146,
    "date": "2026-09-07",
    "entrees": 218,
    "sorties": 0,
    "stockRestant": 291
  },
  {
    "id": "oeuf_147",
    "excelRow": 147,
    "date": "2026-09-08",
    "entrees": 221,
    "sorties": 0,
    "stockRestant": 512
  },
  {
    "id": "oeuf_148",
    "excelRow": 148,
    "date": "2026-09-09",
    "entrees": 221,
    "sorties": 0,
    "stockRestant": 733
  },
  {
    "id": "oeuf_149",
    "excelRow": 149,
    "date": "2026-09-10",
    "entrees": 227,
    "sorties": 0,
    "stockRestant": 960
  },
  {
    "id": "oeuf_150",
    "excelRow": 150,
    "date": "2026-09-11",
    "entrees": 229,
    "sorties": 0,
    "stockRestant": 1189
  },
  {
    "id": "oeuf_151",
    "excelRow": 151,
    "date": "2026-09-12",
    "entrees": 206,
    "sorties": 600,
    "stockRestant": 795
  },
  {
    "id": "oeuf_152",
    "excelRow": 152,
    "date": "2026-09-13",
    "entrees": 188,
    "sorties": 0,
    "stockRestant": 983
  },
  {
    "id": "oeuf_153",
    "excelRow": 153,
    "date": "2026-09-14",
    "entrees": 203,
    "sorties": 0,
    "stockRestant": 1186
  },
  {
    "id": "oeuf_154",
    "excelRow": 154,
    "date": "2026-09-15",
    "entrees": 207,
    "sorties": 0,
    "stockRestant": 1393
  },
  {
    "id": "oeuf_155",
    "excelRow": 155,
    "date": "2026-09-16",
    "entrees": 205,
    "sorties": 0,
    "stockRestant": 1598
  },
  {
    "id": "oeuf_156",
    "excelRow": 156,
    "date": "2026-09-17",
    "entrees": 207,
    "sorties": 1660,
    "stockRestant": 145
  },
  {
    "id": "oeuf_157",
    "excelRow": 157,
    "date": "2026-09-18",
    "entrees": 202,
    "sorties": 0,
    "stockRestant": 347
  },
  {
    "id": "oeuf_158",
    "excelRow": 158,
    "date": "2026-09-19",
    "entrees": 206,
    "sorties": 50,
    "stockRestant": 503
  },
  {
    "id": "oeuf_159",
    "excelRow": 159,
    "date": "2026-09-20",
    "entrees": 208,
    "sorties": 0,
    "stockRestant": 711
  },
  {
    "id": "oeuf_160",
    "excelRow": 160,
    "date": "2026-09-21",
    "entrees": 214,
    "sorties": 15,
    "stockRestant": 910
  },
  {
    "id": "oeuf_161",
    "excelRow": 161,
    "date": "2026-09-22",
    "entrees": 213,
    "sorties": 0,
    "stockRestant": 1123
  },
  {
    "id": "oeuf_162",
    "excelRow": 162,
    "date": "2026-09-23",
    "entrees": 210,
    "sorties": 0,
    "stockRestant": 1333
  },
  {
    "id": "oeuf_163",
    "excelRow": 163,
    "date": "2026-09-24",
    "entrees": 215,
    "sorties": 0,
    "stockRestant": 1548
  },
  {
    "id": "oeuf_164",
    "excelRow": 164,
    "date": "2026-09-25",
    "entrees": 214,
    "sorties": 0,
    "stockRestant": 1762
  },
  {
    "id": "oeuf_165",
    "excelRow": 165,
    "date": "2026-09-26",
    "entrees": 213,
    "sorties": 800,
    "stockRestant": 1175
  },
  {
    "id": "oeuf_166",
    "excelRow": 166,
    "date": "2026-09-27",
    "entrees": 214,
    "sorties": 0,
    "stockRestant": 1389
  },
  {
    "id": "oeuf_167",
    "excelRow": 167,
    "date": "2026-09-28",
    "entrees": 211,
    "sorties": 0,
    "stockRestant": 1600
  },
  {
    "id": "oeuf_168",
    "excelRow": 168,
    "date": "2026-09-29",
    "entrees": 216,
    "sorties": 0,
    "stockRestant": 1816
  },
  {
    "id": "oeuf_169",
    "excelRow": 169,
    "date": "2026-09-30",
    "entrees": 215,
    "sorties": 1900,
    "stockRestant": 131
  },
  {
    "id": "oeuf_170",
    "excelRow": 170,
    "date": "2026-10-01",
    "entrees": 214,
    "sorties": 0,
    "stockRestant": 345
  },
  {
    "id": "oeuf_171",
    "excelRow": 171,
    "date": "2026-10-02",
    "entrees": 212,
    "sorties": 0,
    "stockRestant": 557
  },
  {
    "id": "oeuf_172",
    "excelRow": 172,
    "date": "2026-10-03",
    "entrees": 212,
    "sorties": 0,
    "stockRestant": 769
  },
  {
    "id": "oeuf_173",
    "excelRow": 173,
    "date": "2026-10-04",
    "entrees": 211,
    "sorties": 0,
    "stockRestant": 980
  },
  {
    "id": "oeuf_174",
    "excelRow": 174,
    "date": "2026-10-05",
    "entrees": 212,
    "sorties": 550,
    "stockRestant": 642
  },
  {
    "id": "oeuf_175",
    "excelRow": 175,
    "date": "2026-10-06",
    "entrees": 209,
    "sorties": 0,
    "stockRestant": 851
  },
  {
    "id": "oeuf_176",
    "excelRow": 176,
    "date": "2026-10-07",
    "entrees": 206,
    "sorties": 0,
    "stockRestant": 1057
  },
  {
    "id": "oeuf_177",
    "excelRow": 177,
    "date": "2026-10-08",
    "entrees": 201,
    "sorties": 0,
    "stockRestant": 1258
  },
  {
    "id": "oeuf_178",
    "excelRow": 178,
    "date": "2026-10-09",
    "entrees": 201,
    "sorties": 700,
    "stockRestant": 759
  },
  {
    "id": "oeuf_179",
    "excelRow": 179,
    "date": "2026-10-10",
    "entrees": 206,
    "sorties": 0,
    "stockRestant": 965
  },
  {
    "id": "oeuf_180",
    "excelRow": 180,
    "date": "2026-10-11",
    "entrees": 210,
    "sorties": 0,
    "stockRestant": 1175
  },
  {
    "id": "oeuf_181",
    "excelRow": 181,
    "date": "2026-10-12",
    "entrees": 211,
    "sorties": 0,
    "stockRestant": 1386
  },
  {
    "id": "oeuf_182",
    "excelRow": 182,
    "date": "2026-10-13",
    "entrees": 210,
    "sorties": 1560,
    "stockRestant": 36
  },
  {
    "id": "oeuf_183",
    "excelRow": 183,
    "date": "2026-10-14",
    "entrees": 212,
    "sorties": 0,
    "stockRestant": 248
  },
  {
    "id": "oeuf_184",
    "excelRow": 184,
    "date": "2026-10-15",
    "entrees": 213,
    "sorties": 0,
    "stockRestant": 461
  },
  {
    "id": "oeuf_185",
    "excelRow": 185,
    "date": "2026-10-16",
    "entrees": 211,
    "sorties": 0,
    "stockRestant": 672
  },
  {
    "id": "oeuf_186",
    "excelRow": 186,
    "date": "2026-10-17",
    "entrees": 209,
    "sorties": 550,
    "stockRestant": 331
  },
  {
    "id": "oeuf_187",
    "excelRow": 187,
    "date": "2026-10-18",
    "entrees": 201,
    "sorties": 0,
    "stockRestant": 532
  },
  {
    "id": "oeuf_188",
    "excelRow": 188,
    "date": "2026-10-19",
    "entrees": 204,
    "sorties": 0,
    "stockRestant": 736
  },
  {
    "id": "oeuf_189",
    "excelRow": 189,
    "date": "2026-10-20",
    "entrees": 200,
    "sorties": 0,
    "stockRestant": 936
  },
  {
    "id": "oeuf_190",
    "excelRow": 190,
    "date": "2026-10-21",
    "entrees": 193,
    "sorties": 0,
    "stockRestant": 1129
  },
  {
    "id": "oeuf_191",
    "excelRow": 191,
    "date": "2026-10-22",
    "entrees": 188,
    "sorties": 0,
    "stockRestant": 1317
  },
  {
    "id": "oeuf_192",
    "excelRow": 192,
    "date": "2026-10-23",
    "entrees": 191,
    "sorties": 0,
    "stockRestant": 1508
  },
  {
    "id": "oeuf_193",
    "excelRow": 193,
    "date": "2026-10-24",
    "entrees": 191,
    "sorties": 0,
    "stockRestant": 1699
  },
  {
    "id": "oeuf_194",
    "excelRow": 194,
    "date": "2026-10-25",
    "entrees": 184,
    "sorties": 0,
    "stockRestant": 1883
  },
  {
    "id": "oeuf_195",
    "excelRow": 195,
    "date": "2026-10-26",
    "entrees": 195,
    "sorties": 15,
    "stockRestant": 2063
  },
  {
    "id": "oeuf_196",
    "excelRow": 196,
    "date": "2026-10-27",
    "entrees": 193,
    "sorties": 550,
    "stockRestant": 1706
  },
  {
    "id": "oeuf_197",
    "excelRow": 197,
    "date": "2026-10-28",
    "entrees": 185,
    "sorties": 0,
    "stockRestant": 1891
  },
  {
    "id": "oeuf_198",
    "excelRow": 198,
    "date": "2026-10-29",
    "entrees": 197,
    "sorties": 1600,
    "stockRestant": 488
  },
  {
    "id": "oeuf_199",
    "excelRow": 199,
    "date": "2026-10-30",
    "entrees": 186,
    "sorties": 0,
    "stockRestant": 674
  },
  {
    "id": "oeuf_200",
    "excelRow": 200,
    "date": "2026-10-31",
    "entrees": 184,
    "sorties": 0,
    "stockRestant": 858
  },
  {
    "id": "oeuf_201",
    "excelRow": 201,
    "date": "2026-11-01",
    "entrees": 183,
    "sorties": 0,
    "stockRestant": 1041
  },
  {
    "id": "oeuf_202",
    "excelRow": 202,
    "date": "2026-11-02",
    "entrees": 181,
    "sorties": 0,
    "stockRestant": 1222
  },
  {
    "id": "oeuf_203",
    "excelRow": 203,
    "date": "2026-11-03",
    "entrees": 192,
    "sorties": 15,
    "stockRestant": 1399
  }
];

export const INITIAL_FACTURES = [
  {
    "id": "fact_3",
    "excelRow": 3,
    "date": "2026-06-20",
    "numeroFacture": "76",
    "quantite": 1000,
    "prixUnitaire": 1900,
    "total": 1900000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_4",
    "excelRow": 4,
    "date": "2026-07-02",
    "numeroFacture": "83",
    "quantite": 15,
    "prixUnitaire": 2200,
    "total": 33000,
    "client": "JEYNA",
    "statut": "Payé"
  },
  {
    "id": "fact_5",
    "excelRow": 5,
    "date": "2026-07-07",
    "numeroFacture": "84",
    "quantite": 1000,
    "prixUnitaire": 2000,
    "total": 2000000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_6",
    "excelRow": 6,
    "date": "2026-07-07",
    "numeroFacture": "85",
    "quantite": 500,
    "prixUnitaire": 2000,
    "total": 1000000,
    "client": "BARA BEYE",
    "statut": "Payé"
  },
  {
    "id": "fact_7",
    "excelRow": 7,
    "date": "2026-07-09",
    "numeroFacture": "87",
    "quantite": 20,
    "prixUnitaire": 2000,
    "total": 40000,
    "client": "CAR THIES",
    "statut": "Payé"
  },
  {
    "id": "fact_8",
    "excelRow": 8,
    "date": "2026-07-14",
    "numeroFacture": "89",
    "quantite": 500,
    "prixUnitaire": 2000,
    "total": 1000000,
    "client": "MOUSSA SALL",
    "statut": "Payé"
  },
  {
    "id": "fact_9",
    "excelRow": 9,
    "date": "2026-07-19",
    "numeroFacture": "92",
    "quantite": 450,
    "prixUnitaire": 2000,
    "total": 900000,
    "client": "MOUHAMED SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_10",
    "excelRow": 10,
    "date": "2026-07-27",
    "numeroFacture": "96",
    "quantite": 10,
    "prixUnitaire": 2000,
    "total": 20000,
    "client": "CAR THIES",
    "statut": "Payé"
  },
  {
    "id": "fact_11",
    "excelRow": 11,
    "date": "2026-07-29",
    "numeroFacture": "97",
    "quantite": 1000,
    "prixUnitaire": 2000,
    "total": 2000000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_12",
    "excelRow": 12,
    "date": "2026-07-29",
    "numeroFacture": "98",
    "quantite": 700,
    "prixUnitaire": 2000,
    "total": 1400000,
    "client": "BARA BEYE",
    "statut": "Payé"
  },
  {
    "id": "fact_13",
    "excelRow": 13,
    "date": "2026-08-04",
    "numeroFacture": "99",
    "quantite": 15,
    "prixUnitaire": 2000,
    "total": 30000,
    "client": "KALIDOU GUISSE",
    "statut": "Payé"
  },
  {
    "id": "fact_14",
    "excelRow": 14,
    "date": "2026-08-05",
    "numeroFacture": "51",
    "quantite": 700,
    "prixUnitaire": 2000,
    "total": 1400000,
    "client": "BARA BEYE",
    "statut": "Payé"
  },
  {
    "id": "fact_15",
    "excelRow": 15,
    "date": "2026-08-05",
    "numeroFacture": "0",
    "quantite": 1000,
    "prixUnitaire": 2000,
    "total": 2000000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_16",
    "excelRow": 16,
    "date": "2026-08-11",
    "numeroFacture": "52",
    "quantite": 20,
    "prixUnitaire": 2000,
    "total": 40000,
    "client": "KALIDOU GUISSE",
    "statut": "Payé"
  },
  {
    "id": "fact_17",
    "excelRow": 17,
    "date": "2026-08-16",
    "numeroFacture": "56",
    "quantite": 15,
    "prixUnitaire": 2000,
    "total": 30000,
    "client": "KALIDOU GUISSE",
    "statut": "Payé"
  },
  {
    "id": "fact_18",
    "excelRow": 18,
    "date": "2026-08-17",
    "numeroFacture": "57",
    "quantite": 600,
    "prixUnitaire": 2100,
    "total": 1260000,
    "client": "COUMBA NDIR",
    "statut": "Payé"
  },
  {
    "id": "fact_19",
    "excelRow": 19,
    "date": "2026-08-19",
    "numeroFacture": "58",
    "quantite": 1050,
    "prixUnitaire": 2100,
    "total": 2205000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_20",
    "excelRow": 20,
    "date": "2026-08-20",
    "numeroFacture": "59",
    "quantite": 10,
    "prixUnitaire": 2100,
    "total": 21000,
    "client": "KALIDOU GUISSE",
    "statut": "Payé"
  },
  {
    "id": "fact_21",
    "excelRow": 21,
    "date": "2026-08-23",
    "numeroFacture": "60",
    "quantite": 950,
    "prixUnitaire": 2100,
    "total": 1995000,
    "client": "BARA BEYE",
    "statut": "Payé"
  },
  {
    "id": "fact_22",
    "excelRow": 22,
    "date": "2026-08-26",
    "numeroFacture": "63",
    "quantite": 5,
    "prixUnitaire": 2100,
    "total": 10500,
    "client": "KALIDOU GUISSE",
    "statut": "Payé"
  },
  {
    "id": "fact_23",
    "excelRow": 23,
    "date": "2026-08-28",
    "numeroFacture": "64",
    "quantite": 1130,
    "prixUnitaire": 2100,
    "total": 2373000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_24",
    "excelRow": 24,
    "date": "2026-09-01",
    "numeroFacture": "65",
    "quantite": 60,
    "prixUnitaire": 2100,
    "total": 126000,
    "client": "MOUSSA GUISSE",
    "statut": "Payé"
  },
  {
    "id": "fact_25",
    "excelRow": 25,
    "date": "2026-09-01",
    "numeroFacture": "66",
    "quantite": 500,
    "prixUnitaire": 2100,
    "total": 1050000,
    "client": "COUMBA NDIR",
    "statut": "Payé"
  },
  {
    "id": "fact_26",
    "excelRow": 26,
    "date": "2026-06-13",
    "numeroFacture": "72",
    "quantite": 700,
    "prixUnitaire": 2000,
    "total": 1400000,
    "client": "BARA BEYE",
    "statut": "Payé"
  },
  {
    "id": "fact_27",
    "excelRow": 27,
    "date": "2026-06-13",
    "numeroFacture": "71",
    "quantite": 1000,
    "prixUnitaire": 1900,
    "total": 1900000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_28",
    "excelRow": 28,
    "date": "2026-07-14",
    "numeroFacture": "90",
    "quantite": 900,
    "prixUnitaire": 2000,
    "total": 1800000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_29",
    "excelRow": 29,
    "date": "2026-07-14",
    "numeroFacture": "91",
    "quantite": 700,
    "prixUnitaire": 2000,
    "total": 1400000,
    "client": "BARA BEYE",
    "statut": "Payé"
  },
  {
    "id": "fact_30",
    "excelRow": 30,
    "date": "2026-07-08",
    "numeroFacture": "86",
    "quantite": 30,
    "prixUnitaire": 2000,
    "total": 60000,
    "client": "CAR THIES",
    "statut": "Payé"
  },
  {
    "id": "fact_31",
    "excelRow": 31,
    "date": "2026-06-15",
    "numeroFacture": "75",
    "quantite": 200,
    "prixUnitaire": 2100,
    "total": 420000,
    "client": "MOUSSA GUISSE",
    "statut": "Payé"
  },
  {
    "id": "fact_32",
    "excelRow": 32,
    "date": "2026-06-15",
    "numeroFacture": "74",
    "quantite": 500,
    "prixUnitaire": 2100,
    "total": 1050000,
    "client": "SAFIETOU DIEME",
    "statut": "Payé"
  },
  {
    "id": "fact_33",
    "excelRow": 33,
    "date": "2026-06-02",
    "numeroFacture": "70",
    "quantite": 500,
    "prixUnitaire": 2000,
    "total": 1000000,
    "client": "BARA BEYE",
    "statut": "Payé"
  },
  {
    "id": "fact_34",
    "excelRow": 34,
    "date": "2026-06-02",
    "numeroFacture": "69",
    "quantite": 1190,
    "prixUnitaire": 1900,
    "total": 2261000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_35",
    "excelRow": 35,
    "date": "2026-07-22",
    "numeroFacture": "94",
    "quantite": 1000,
    "prixUnitaire": 2000,
    "total": 2000000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_36",
    "excelRow": 36,
    "date": "2026-07-22",
    "numeroFacture": "95",
    "quantite": 700,
    "prixUnitaire": 2000,
    "total": 1400000,
    "client": "BARA BEYE",
    "statut": "Payé"
  },
  {
    "id": "fact_37",
    "excelRow": 37,
    "date": "2026-08-04",
    "numeroFacture": "99",
    "quantite": 15,
    "prixUnitaire": 2000,
    "total": 30000,
    "client": "MOUSSA GUISSE",
    "statut": "Payé"
  },
  {
    "id": "fact_38",
    "excelRow": 38,
    "date": "2026-06-29",
    "numeroFacture": "80",
    "quantite": 1150,
    "prixUnitaire": 2000,
    "total": 2300000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_39",
    "excelRow": 39,
    "date": "2026-06-29",
    "numeroFacture": "81",
    "quantite": 500,
    "prixUnitaire": 2000,
    "total": 1000000,
    "client": "BARA BEYE",
    "statut": "Payé"
  },
  {
    "id": "fact_40",
    "excelRow": 40,
    "date": "2026-07-14",
    "numeroFacture": "89",
    "quantite": 500,
    "prixUnitaire": 2000,
    "total": 1000000,
    "client": "MOUSSA SALL",
    "statut": "Payé"
  },
  {
    "id": "fact_41",
    "excelRow": 41,
    "date": "2026-06-30",
    "numeroFacture": "82",
    "quantite": 15,
    "prixUnitaire": 2000,
    "total": 30000,
    "client": "KALIDOU GUISSE",
    "statut": "Payé"
  },
  {
    "id": "fact_42",
    "excelRow": 42,
    "date": "2026-06-27",
    "numeroFacture": "79",
    "quantite": 35,
    "prixUnitaire": 2000,
    "total": 70000,
    "client": "KALIDOU GUISSE",
    "statut": "Payé"
  },
  {
    "id": "fact_43",
    "excelRow": 43,
    "date": "2026-06-20",
    "numeroFacture": "77",
    "quantite": 500,
    "prixUnitaire": 2000,
    "total": 1000000,
    "client": "BARA BEYE",
    "statut": "Payé"
  },
  {
    "id": "fact_44",
    "excelRow": 44,
    "date": "2026-06-20",
    "numeroFacture": "76",
    "quantite": 1000,
    "prixUnitaire": 2000,
    "total": 2000000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_45",
    "excelRow": 45,
    "date": "2026-05-29",
    "numeroFacture": "68",
    "quantite": 100,
    "prixUnitaire": 1900,
    "total": 190000,
    "client": "MOUSSA GUISSE",
    "statut": "Payé"
  },
  {
    "id": "fact_46",
    "excelRow": 46,
    "date": "2026-05-24",
    "numeroFacture": "67",
    "quantite": 1010,
    "prixUnitaire": 1800,
    "total": 1818000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_47",
    "excelRow": 47,
    "date": "2026-05-20",
    "numeroFacture": "66",
    "quantite": 500,
    "prixUnitaire": 1800,
    "total": 900000,
    "client": "BARA BEYE",
    "statut": "Payé"
  },
  {
    "id": "fact_48",
    "excelRow": 48,
    "date": "2026-05-19",
    "numeroFacture": "65",
    "quantite": 11,
    "prixUnitaire": 1700,
    "total": 18700,
    "client": "KALIDOU GUISSE",
    "statut": "Payé"
  },
  {
    "id": "fact_49",
    "excelRow": 49,
    "date": "2026-05-16",
    "numeroFacture": "64",
    "quantite": 685,
    "prixUnitaire": 1700,
    "total": 1164500,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_50",
    "excelRow": 50,
    "date": "2026-05-14",
    "numeroFacture": "59",
    "quantite": 100,
    "prixUnitaire": 1700,
    "total": 170000,
    "client": "MOUSSA GUISSE",
    "statut": "Payé"
  },
  {
    "id": "fact_51",
    "excelRow": 51,
    "date": "2026-05-12",
    "numeroFacture": "58",
    "quantite": 500,
    "prixUnitaire": 1700,
    "total": 850000,
    "client": "MAMADOU DIOP",
    "statut": "Payé"
  },
  {
    "id": "fact_52",
    "excelRow": 52,
    "date": "2026-05-09",
    "numeroFacture": "57",
    "quantite": 1100,
    "prixUnitaire": 1600,
    "total": 1760000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_53",
    "excelRow": 53,
    "date": "2026-08-11",
    "numeroFacture": "52",
    "quantite": 20,
    "prixUnitaire": 2000,
    "total": 40000,
    "client": "KALIDOU GUISSE",
    "statut": "Payé"
  },
  {
    "id": "fact_54",
    "excelRow": 54,
    "date": "2026-09-06",
    "numeroFacture": "69",
    "quantite": 1000,
    "prixUnitaire": 2100,
    "total": 2100000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_55",
    "excelRow": 55,
    "date": "2026-09-06",
    "numeroFacture": "68",
    "quantite": 500,
    "prixUnitaire": 2200,
    "total": 1100000,
    "client": "BARA BEYE",
    "statut": "Payé"
  },
  {
    "id": "fact_56",
    "excelRow": 56,
    "date": "2026-09-12",
    "numeroFacture": "70",
    "quantite": 550,
    "prixUnitaire": 2200,
    "total": 1210000,
    "client": "COUMBA NDIR",
    "statut": "Payé"
  },
  {
    "id": "fact_57",
    "excelRow": 57,
    "date": "2026-09-12",
    "numeroFacture": "71",
    "quantite": 50,
    "prixUnitaire": 2200,
    "total": 110000,
    "client": "MBAYE ET FRERE",
    "statut": "Payé"
  },
  {
    "id": "fact_58",
    "excelRow": 58,
    "date": "2026-09-17",
    "numeroFacture": "72",
    "quantite": 60,
    "prixUnitaire": 2200,
    "total": 132000,
    "client": "MOUSSA GUISSE",
    "statut": "Payé"
  },
  {
    "id": "fact_59",
    "excelRow": 59,
    "date": "2026-09-17",
    "numeroFacture": "73",
    "quantite": 1000,
    "prixUnitaire": 2200,
    "total": 2200000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_60",
    "excelRow": 60,
    "date": "2026-09-17",
    "numeroFacture": "74",
    "quantite": 600,
    "prixUnitaire": 2200,
    "total": 1320000,
    "client": "BARA BEYE",
    "statut": "Payé"
  },
  {
    "id": "fact_61",
    "excelRow": 61,
    "date": "2026-06-19",
    "numeroFacture": "75",
    "quantite": 50,
    "prixUnitaire": 2200,
    "total": 110000,
    "client": "MBAYE ET FRERE",
    "statut": "Payé"
  },
  {
    "id": "fact_62",
    "excelRow": 62,
    "date": "2026-09-26",
    "numeroFacture": "77",
    "quantite": 800,
    "prixUnitaire": 2200,
    "total": 1760000,
    "client": "COUMBA NDIR",
    "statut": "Payé"
  },
  {
    "id": "fact_63",
    "excelRow": 63,
    "date": "2026-09-30",
    "numeroFacture": "78",
    "quantite": 1000,
    "prixUnitaire": 2200,
    "total": 2200000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_64",
    "excelRow": 64,
    "date": "2026-09-30",
    "numeroFacture": "80",
    "quantite": 600,
    "prixUnitaire": 2300,
    "total": 1380000,
    "client": "BARA BEYE",
    "statut": "Payé"
  },
  {
    "id": "fact_65",
    "excelRow": 65,
    "date": "2026-09-30",
    "numeroFacture": "81",
    "quantite": 300,
    "prixUnitaire": 2300,
    "total": 690000,
    "client": "MOUSSA SALL",
    "statut": "Payé"
  },
  {
    "id": "fact_66",
    "excelRow": 66,
    "date": "2026-10-05",
    "numeroFacture": "82",
    "quantite": 550,
    "prixUnitaire": 2200,
    "total": 1210000,
    "client": "COUMBA NDIR",
    "statut": "Payé"
  },
  {
    "id": "fact_67",
    "excelRow": 67,
    "date": "2026-10-10",
    "numeroFacture": "83",
    "quantite": 700,
    "prixUnitaire": 2200,
    "total": 1540000,
    "client": "OMAR SARR",
    "statut": "Payé"
  },
  {
    "id": "fact_68",
    "excelRow": 68,
    "date": "2026-10-13",
    "numeroFacture": "84",
    "quantite": 60,
    "prixUnitaire": 2200,
    "total": 132000,
    "client": "MOUSSA GUISSE",
    "statut": "Payé"
  },
  {
    "id": "fact_69",
    "excelRow": 69,
    "date": "2026-10-13",
    "numeroFacture": "85",
    "quantite": 900,
    "prixUnitaire": 2200,
    "total": 1980000,
    "client": "OMAR SARR",
    "statut": "Non Payé"
  },
  {
    "id": "fact_70",
    "excelRow": 70,
    "date": "2026-10-13",
    "numeroFacture": "86",
    "quantite": 600,
    "prixUnitaire": 2300,
    "total": 1380000,
    "client": "BARA BEYE",
    "statut": "Non Payé"
  },
  {
    "id": "fact_71",
    "excelRow": 71,
    "date": "2026-10-17",
    "numeroFacture": "87",
    "quantite": 550,
    "prixUnitaire": 2200,
    "total": 1210000,
    "client": "COUMBA NDIR",
    "statut": "Payé"
  },
  {
    "id": "fact_72",
    "excelRow": 72,
    "date": "2026-10-27",
    "numeroFacture": "88",
    "quantite": 550,
    "prixUnitaire": 2200,
    "total": 1210000,
    "client": "FABAY GROUPE",
    "statut": "Payé"
  },
  {
    "id": "fact_73",
    "excelRow": 73,
    "date": "2026-10-29",
    "numeroFacture": "89",
    "quantite": 1000,
    "prixUnitaire": 2200,
    "total": 2200000,
    "client": "OMAR SARR",
    "statut": "Non Payé"
  },
  {
    "id": "fact_74",
    "excelRow": 74,
    "date": "2026-10-29",
    "numeroFacture": "90",
    "quantite": 600,
    "prixUnitaire": 2200,
    "total": 1320000,
    "client": "BARA BEYE",
    "statut": "Non Payé"
  },
  {
    "id": "fact_75",
    "excelRow": 75,
    "date": "2026-11-03",
    "numeroFacture": "91",
    "quantite": 15,
    "prixUnitaire": 2200,
    "total": 33000,
    "client": "KALIDOU GUISSE",
    "statut": "Payé"
  }
];

export const INITIAL_CONSTRUCTIONS = [
  {
    "id": "const_3",
    "date": "2026-10-12",
    "designation": "Peintre",
    "montant": 70000
  },
  {
    "id": "const_4",
    "date": "2026-10-12",
    "designation": "Aluminium",
    "montant": 100000
  },
  {
    "id": "const_5",
    "date": "2026-10-17",
    "designation": "Mouleurs",
    "montant": 70000
  },
  {
    "id": "const_6",
    "date": "2026-10-30",
    "designation": "60 tables bancs",
    "montant": 1560000
  }
];

export const INITIAL_AUTRES_DEPENSES = [
  {
    "id": "dep_3",
    "date": "2026-09-28",
    "produit": "Coupe Bois",
    "montant": 100000
  },
  {
    "id": "dep_4",
    "date": "2026-09-29",
    "produit": "Electricien",
    "montant": 10000
  },
  {
    "id": "dep_5",
    "date": "2026-09-30",
    "produit": "Versement aliment",
    "montant": 2000000
  },
  {
    "id": "dep_6",
    "date": "2026-09-30",
    "produit": "Poudre fourmil",
    "montant": 30000
  },
  {
    "id": "dep_7",
    "date": "2026-10-03",
    "produit": "Transport aliment",
    "montant": 25000
  },
  {
    "id": "dep_8",
    "date": "2026-10-03",
    "produit": "Alveoles 78 paquets",
    "montant": 195000
  },
  {
    "id": "dep_9",
    "date": "2026-10-07",
    "produit": "Versement Mme Dieng pour 20 sacs d'aliment",
    "montant": 338350
  },
  {
    "id": "dep_10",
    "date": "2026-10-08",
    "produit": "Pa Kida",
    "montant": 35000
  },
  {
    "id": "dep_11",
    "date": "2026-10-12",
    "produit": "Dresseur",
    "montant": 80000
  },
  {
    "id": "dep_12",
    "date": "2026-10-14",
    "produit": "Versement aliment",
    "montant": 1240000
  },
  {
    "id": "dep_13",
    "date": "2026-10-14",
    "produit": "Essence",
    "montant": 30000
  },
  {
    "id": "dep_14",
    "date": "2026-10-14",
    "produit": "Gasoil",
    "montant": 40000
  },
  {
    "id": "dep_15",
    "date": "2026-10-15",
    "produit": "Ravitaillement",
    "montant": 39600
  },
  {
    "id": "dep_16",
    "date": "2026-10-15",
    "produit": "Depenses Mer Bi",
    "montant": 45000
  },
  {
    "id": "dep_17",
    "date": "2026-10-17",
    "produit": "Transport aliment",
    "montant": 25000
  },
  {
    "id": "dep_18",
    "date": "2026-10-19",
    "produit": "62 Paquets Alveoles",
    "montant": 155000
  },
  {
    "id": "dep_19",
    "date": "2026-10-23",
    "produit": "Facture veerinaire",
    "montant": 207000
  },
  {
    "id": "dep_20",
    "date": "2026-10-30",
    "produit": "Ravitaillement chez les talibes",
    "montant": 76000
  },
  {
    "id": "dep_21",
    "date": "2026-10-31",
    "produit": "Transport aliment",
    "montant": 25000
  },
  {
    "id": "dep_22",
    "date": "2026-11-03",
    "produit": "Dresseur",
    "montant": 110000
  }
];

export const INITIAL_EMPLOYES = [
  {
    "id": "emp_1",
    "nom": "COLY",
    "poste": "Aviculteur - Boxe 1",
    "salaireMensuel": 0,
    "dateDebut": "2026-03-24",
    "dateFin": "",
    "nbMoisManuel": null,
    "actif": true
  },
  {
    "id": "emp_2",
    "nom": "Omar GUISSE",
    "poste": "Chef d'équipe / Gérant",
    "salaireMensuel": 0,
    "dateDebut": "2026-03-24",
    "dateFin": "",
    "nbMoisManuel": null,
    "actif": true
  },
  {
    "id": "emp_3",
    "nom": "Siradio CISSE",
    "poste": "Aviculteur - Boxe 2",
    "salaireMensuel": 0,
    "dateDebut": "2026-03-24",
    "dateFin": "",
    "nbMoisManuel": null,
    "actif": true
  },
  {
    "id": "emp_4",
    "nom": "BALDE",
    "poste": "Gardien & Suivi Stock",
    "salaireMensuel": 0,
    "dateDebut": "2026-03-24",
    "dateFin": "",
    "nbMoisManuel": null,
    "actif": true
  }
];

export const INITIAL_BILAN_PARAMS = {
  "prixSacAliment": 0,
  "prixPoussin": 0,
  "prixTabletteDefaut": 2200
};
