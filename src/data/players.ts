// ============================================================
// IPL DRAFT SIMULATOR — PLAYER DATABASE
// Tuned to Real-Life T20 Stats & Roles
// ============================================================

import type { Player } from '../engine/types';

export const PLAYERS: Player[] = [
  {
    "id": "mi_01",
    "name": "Rohit Sharma",
    "team": "MI",
    "role": "Batter",
    "battingPosition": 1,
    "allowedSlots": [1, 2],
    "batRating": 88,
    "powRating": 92,
    "bwlRating": 15
  },
  {
    "id": "mi_02",
    "name": "Suryakumar Yadav",
    "team": "MI",
    "role": "Batter",
    "battingPosition": 3,
    "allowedSlots": [3, 4],
    "batRating": 87,
    "powRating": 92,
    "bwlRating": 5
  },
  {
    "id": "mi_03",
    "name": "Sherfane Rutherford",
    "team": "MI",
    "role": "Batter",
    "battingPosition": 5,
    "allowedSlots": [5, 6, 7],
    "batRating": 72,
    "powRating": 89,
    "bwlRating": 18
  },
  {
    "id": "mi_04",
    "name": "Tilak Varma",
    "team": "MI",
    "role": "Batter",
    "battingPosition": 4,
    "allowedSlots": [3, 4, 5],
    "batRating": 86,
    "powRating": 85,
    "bwlRating": 25
  },
  {
    "id": "mi_05",
    "name": "Ryan Rickelton",
    "team": "MI",
    "role": "WK",
    "battingPosition": 1,
    "allowedSlots": [1, 2, 3],
    "batRating": 78,
    "powRating": 84,
    "bwlRating": 5
  },
  {
    "id": "mi_06",
    "name": "Quinton de Kock",
    "team": "MI",
    "role": "WK",
    "battingPosition": 1,
    "allowedSlots": [1, 2],
    "batRating": 85,
    "powRating": 89,
    "bwlRating": 5
  },
  {
    "id": "mi_07",
    "name": "Hardik Pandya",
    "team": "MI",
    "role": "All-Rounder",
    "battingPosition": 5,
    "allowedSlots": [5, 6, 7],
    "batRating": 82,
    "powRating": 88,
    "bwlRating": 83
  },
  {
    "id": "mi_08",
    "name": "Naman Dhir",
    "team": "MI",
    "role": "All-Rounder",
    "battingPosition": 3,
    "allowedSlots": [3, 4, 5, 6],
    "batRating": 75,
    "powRating": 84,
    "bwlRating": 68
  },
  {
    "id": "mi_09",
    "name": "Will Jacks",
    "team": "MI",
    "role": "All-Rounder",
    "battingPosition": 1,
    "allowedSlots": [1, 2, 3],
    "batRating": 80,
    "powRating": 92,
    "bwlRating": 74
  },
  {
    "id": "mi_10",
    "name": "Shardul Thakur",
    "team": "MI",
    "role": "All-Rounder",
    "battingPosition": 8,
    "allowedSlots": [7, 8, 9],
    "batRating": 65,
    "powRating": 76,
    "bwlRating": 80
  },
  {
    "id": "mi_11",
    "name": "Jasprit Bumrah",
    "team": "MI",
    "role": "Bowler",
    "battingPosition": 10,
    "allowedSlots": [9, 10, 11],
    "batRating": 15,
    "powRating": 25,
    "bwlRating": 98
  },
  {
    "id": "mi_12",
    "name": "Trent Boult",
    "team": "MI",
    "role": "Bowler",
    "battingPosition": 11,
    "allowedSlots": [9, 10, 11],
    "batRating": 10,
    "powRating": 20,
    "bwlRating": 92
  },
  {
    "id": "mi_13",
    "name": "AM Ghazanfar",
    "team": "MI",
    "role": "Bowler",
    "battingPosition": 9,
    "allowedSlots": [8, 9, 10, 11],
    "batRating": 15,
    "powRating": 22,
    "bwlRating": 80
  },
  {
    "id": "mi_14",
    "name": "Deepak Chahar",
    "team": "MI",
    "role": "Bowler",
    "battingPosition": 8,
    "allowedSlots": [8, 9, 10],
    "batRating": 45,
    "powRating": 60,
    "bwlRating": 84
  },
  {
    "id": "csk_01",
    "name": "Ruturaj Gaikwad",
    "team": "CSK",
    "role": "Batter",
    "battingPosition": 1,
    "allowedSlots": [1, 2, 3],
    "batRating": 92,
    "powRating": 84,
    "bwlRating": 5
  },
  {
    "id": "csk_02",
    "name": "Dewald Brevis",
    "team": "CSK",
    "role": "Batter",
    "battingPosition": 3,
    "allowedSlots": [3, 4, 5],
    "batRating": 76,
    "powRating": 88,
    "bwlRating": 10
  },
  {
    "id": "csk_03",
    "name": "Sarfaraz Khan",
    "team": "CSK",
    "role": "Batter",
    "battingPosition": 4,
    "allowedSlots": [3, 4, 5],
    "batRating": 84,
    "powRating": 76,
    "bwlRating": 5
  },
  {
    "id": "csk_04",
    "name": "Ayush Mhatre",
    "team": "CSK",
    "role": "Batter",
    "battingPosition": 1,
    "allowedSlots": [1, 2, 3],
    "batRating": 72,
    "powRating": 78,
    "bwlRating": 15
  },
  {
    "id": "csk_05",
    "name": "MS Dhoni",
    "team": "CSK",
    "role": "WK",
    "battingPosition": 7,
    "allowedSlots": [6, 7, 8],
    "batRating": 89,
    "powRating": 94,
    "bwlRating": 10
  },
  {
    "id": "csk_06",
    "name": "Kartik Sharma",
    "team": "CSK",
    "role": "WK",
    "battingPosition": 4,
    "allowedSlots": [4, 5, 6],
    "batRating": 68,
    "powRating": 74,
    "bwlRating": 5
  },
  {
    "id": "csk_07",
    "name": "Aman Khan",
    "team": "CSK",
    "role": "All-Rounder",
    "battingPosition": 6,
    "allowedSlots": [6, 7],
    "batRating": 65,
    "powRating": 82,
    "bwlRating": 62
  },
  {
    "id": "csk_08",
    "name": "Shivam Dube",
    "team": "CSK",
    "role": "All-Rounder",
    "battingPosition": 4,
    "allowedSlots": [4, 5, 6],
    "batRating": 80,
    "powRating": 94,
    "bwlRating": 58
  },
  {
    "id": "csk_09",
    "name": "Zak Foulkes",
    "team": "CSK",
    "role": "All-Rounder",
    "battingPosition": 7,
    "allowedSlots": [7, 8],
    "batRating": 60,
    "powRating": 72,
    "bwlRating": 75
  },
  {
    "id": "csk_10",
    "name": "Ramakrishna Ghosh",
    "team": "CSK",
    "role": "All-Rounder",
    "battingPosition": 7,
    "allowedSlots": [6, 7, 8],
    "batRating": 62,
    "powRating": 74,
    "bwlRating": 68
  },
  {
    "id": "csk_11",
    "name": "Khaleel Ahmed",
    "team": "CSK",
    "role": "Bowler",
    "battingPosition": 11,
    "allowedSlots": [9, 10, 11],
    "batRating": 10,
    "powRating": 15,
    "bwlRating": 84
  },
  {
    "id": "csk_12",
    "name": "Rahul Chahar",
    "team": "CSK",
    "role": "Bowler",
    "battingPosition": 9,
    "allowedSlots": [8, 9, 10],
    "batRating": 25,
    "powRating": 35,
    "bwlRating": 82
  },
  {
    "id": "csk_13",
    "name": "Shreyas Gopal",
    "team": "CSK",
    "role": "Bowler",
    "battingPosition": 8,
    "allowedSlots": [8, 9, 10],
    "batRating": 40,
    "powRating": 50,
    "bwlRating": 78
  },
  {
    "id": "csk_14",
    "name": "Matt Henry",
    "team": "CSK",
    "role": "Bowler",
    "battingPosition": 9,
    "allowedSlots": [8, 9, 10, 11],
    "batRating": 25,
    "powRating": 35,
    "bwlRating": 85
  },
  {
    "id": "kkr_01",
    "name": "Ajinkya Rahane",
    "team": "KKR",
    "role": "Batter",
    "battingPosition": 3,
    "allowedSlots": [1, 2, 3],
    "batRating": 86,
    "powRating": 76,
    "bwlRating": 5
  },
  {
    "id": "kkr_02",
    "name": "Rinku Singh",
    "team": "KKR",
    "role": "Batter",
    "battingPosition": 5,
    "allowedSlots": [5, 6, 7],
    "batRating": 84,
    "powRating": 93,
    "bwlRating": 5
  },
  {
    "id": "kkr_03",
    "name": "Finn Allen",
    "team": "KKR",
    "role": "Batter",
    "battingPosition": 1,
    "allowedSlots": [1, 2],
    "batRating": 76,
    "powRating": 91,
    "bwlRating": 5
  },
  {
    "id": "kkr_04",
    "name": "Rahul Tripathi",
    "team": "KKR",
    "role": "Batter",
    "battingPosition": 3,
    "allowedSlots": [3, 4],
    "batRating": 82,
    "powRating": 85,
    "bwlRating": 5
  },
  {
    "id": "kkr_05",
    "name": "Tim Seifert",
    "team": "KKR",
    "role": "WK",
    "battingPosition": 1,
    "allowedSlots": [1, 2, 3],
    "batRating": 77,
    "powRating": 83,
    "bwlRating": 5
  },
  {
    "id": "kkr_06",
    "name": "Tejasvi Dahiya",
    "team": "KKR",
    "role": "WK",
    "battingPosition": 4,
    "allowedSlots": [4, 5, 6],
    "batRating": 68,
    "powRating": 75,
    "bwlRating": 5
  },
  {
    "id": "kkr_07",
    "name": "Daksh Kamra",
    "team": "KKR",
    "role": "All-Rounder",
    "battingPosition": 6,
    "allowedSlots": [6, 7],
    "batRating": 65,
    "powRating": 70,
    "bwlRating": 65
  },
  {
    "id": "kkr_08",
    "name": "Sunil Narine",
    "team": "KKR",
    "role": "All-Rounder",
    "battingPosition": 1,
    "allowedSlots": [1, 2, 7, 8],
    "batRating": 60,
    "powRating": 92,
    "bwlRating": 94
  },
  {
    "id": "kkr_09",
    "name": "Cameron Green",
    "team": "KKR",
    "role": "All-Rounder",
    "battingPosition": 3,
    "allowedSlots": [3, 4, 5],
    "batRating": 84,
    "powRating": 88,
    "bwlRating": 78
  },
  {
    "id": "kkr_10",
    "name": "Rachin Ravindra",
    "team": "KKR",
    "role": "All-Rounder",
    "battingPosition": 1,
    "allowedSlots": [1, 2, 3],
    "batRating": 83,
    "powRating": 80,
    "bwlRating": 75
  },
  {
    "id": "kkr_11",
    "name": "Vaibhav Arora",
    "team": "KKR",
    "role": "Bowler",
    "battingPosition": 10,
    "allowedSlots": [9, 10, 11],
    "batRating": 15,
    "powRating": 22,
    "bwlRating": 82
  },
  {
    "id": "kkr_12",
    "name": "Saurabh Dubey",
    "team": "KKR",
    "role": "Bowler",
    "battingPosition": 11,
    "allowedSlots": [9, 10, 11],
    "batRating": 10,
    "powRating": 15,
    "bwlRating": 70
  },
  {
    "id": "kkr_13",
    "name": "Kartik Tyagi",
    "team": "KKR",
    "role": "Bowler",
    "battingPosition": 9,
    "allowedSlots": [8, 9, 10, 11],
    "batRating": 20,
    "powRating": 25,
    "bwlRating": 80
  },
  {
    "id": "kkr_14",
    "name": "Navdeep Saini",
    "team": "KKR",
    "role": "Bowler",
    "battingPosition": 9,
    "allowedSlots": [8, 9, 10, 11],
    "batRating": 25,
    "powRating": 35,
    "bwlRating": 76
  },
  {
    "id": "rcb_01",
    "name": "Rajat Patidar",
    "team": "RCB",
    "role": "Batter",
    "battingPosition": 3,
    "allowedSlots": [3, 4, 5],
    "batRating": 85,
    "powRating": 88,
    "bwlRating": 5
  },
  {
    "id": "rcb_02",
    "name": "Virat Kohli",
    "team": "RCB",
    "role": "Batter",
    "battingPosition": 1,
    "allowedSlots": [1, 2, 3],
    "batRating": 95,
    "powRating": 89,
    "bwlRating": 9
  },
  {
    "id": "rcb_03",
    "name": "Tim David",
    "team": "RCB",
    "role": "Batter",
    "battingPosition": 6,
    "allowedSlots": [5, 6, 7],
    "batRating": 74,
    "powRating": 94,
    "bwlRating": 15
  },
  {
    "id": "rcb_04",
    "name": "Devdutt Padikkal",
    "team": "RCB",
    "role": "Batter",
    "battingPosition": 3,
    "allowedSlots": [1, 2, 3],
    "batRating": 81,
    "powRating": 80,
    "bwlRating": 5
  },
  {
    "id": "rcb_05",
    "name": "Phil Salt",
    "team": "RCB",
    "role": "WK",
    "battingPosition": 1,
    "allowedSlots": [1, 2],
    "batRating": 82,
    "powRating": 93,
    "bwlRating": 5
  },
  {
    "id": "rcb_06",
    "name": "Jitesh Sharma",
    "team": "RCB",
    "role": "WK",
    "battingPosition": 5,
    "allowedSlots": [5, 6, 7],
    "batRating": 78,
    "powRating": 87,
    "bwlRating": 5
  },
  {
    "id": "rcb_07",
    "name": "Venkatesh Iyer",
    "team": "RCB",
    "role": "All-Rounder",
    "battingPosition": 3,
    "allowedSlots": [1, 2, 3, 4],
    "batRating": 81,
    "powRating": 85,
    "bwlRating": 62
  },
  {
    "id": "rcb_08",
    "name": "Krunal Pandya",
    "team": "RCB",
    "role": "All-Rounder",
    "battingPosition": 6,
    "allowedSlots": [5, 6, 7],
    "batRating": 75,
    "powRating": 79,
    "bwlRating": 82
  },
  {
    "id": "rcb_09",
    "name": "Mangesh Yadav",
    "team": "RCB",
    "role": "All-Rounder",
    "battingPosition": 7,
    "allowedSlots": [6, 7, 8],
    "batRating": 62,
    "powRating": 68,
    "bwlRating": 66
  },
  {
    "id": "rcb_10",
    "name": "Vihaan Malhotra",
    "team": "RCB",
    "role": "All-Rounder",
    "battingPosition": 6,
    "allowedSlots": [6, 7],
    "batRating": 66,
    "powRating": 72,
    "bwlRating": 64
  },
  {
    "id": "rcb_11",
    "name": "Jacob Duffy",
    "team": "RCB",
    "role": "Bowler",
    "battingPosition": 10,
    "allowedSlots": [9, 10, 11],
    "batRating": 18,
    "powRating": 26,
    "bwlRating": 82
  },
  {
    "id": "rcb_12",
    "name": "Josh Hazlewood",
    "team": "RCB",
    "role": "Bowler",
    "battingPosition": 11,
    "allowedSlots": [9, 10, 11],
    "batRating": 15,
    "powRating": 20,
    "bwlRating": 90
  },
  {
    "id": "rcb_13",
    "name": "Nuwan Thushara",
    "team": "RCB",
    "role": "Bowler",
    "battingPosition": 10,
    "allowedSlots": [9, 10, 11],
    "batRating": 10,
    "powRating": 16,
    "bwlRating": 84
  },
  {
    "id": "rcb_14",
    "name": "Bhuvneshwar Kumar",
    "team": "RCB",
    "role": "Bowler",
    "battingPosition": 9,
    "allowedSlots": [8, 9, 10, 11],
    "batRating": 45,
    "powRating": 35,
    "bwlRating": 94
  },
  {
    "id": "rr_01",
    "name": "Riyan Parag",
    "team": "RR",
    "role": "Batter",
    "battingPosition": 4,
    "allowedSlots": [3, 4, 5],
    "batRating": 85,
    "powRating": 88,
    "bwlRating": 60
  },
  {
    "id": "rr_02",
    "name": "Aman Rao",
    "team": "RR",
    "role": "Batter",
    "battingPosition": 3,
    "allowedSlots": [3, 4, 5],
    "batRating": 70,
    "powRating": 75,
    "bwlRating": 5
  },
  {
    "id": "rr_03",
    "name": "Shubham Dubey",
    "team": "RR",
    "role": "Batter",
    "battingPosition": 5,
    "allowedSlots": [4, 5, 6],
    "batRating": 72,
    "powRating": 85,
    "bwlRating": 5
  },
  {
    "id": "rr_04",
    "name": "Shimron Hetmyer",
    "team": "RR",
    "role": "Batter",
    "battingPosition": 5,
    "allowedSlots": [4, 5, 6],
    "batRating": 78,
    "powRating": 91,
    "bwlRating": 5
  },
  {
    "id": "rr_05",
    "name": "Dhruv Jurel",
    "team": "RR",
    "role": "WK",
    "battingPosition": 5,
    "allowedSlots": [4, 5, 6, 7],
    "batRating": 82,
    "powRating": 87,
    "bwlRating": 5
  },
  {
    "id": "rr_06",
    "name": "Lhuan-dre Pretorius",
    "team": "RR",
    "role": "WK",
    "battingPosition": 1,
    "allowedSlots": [1, 2, 3],
    "batRating": 76,
    "powRating": 82,
    "bwlRating": 5
  },
  {
    "id": "rr_07",
    "name": "Ravindra Jadeja",
    "team": "RR",
    "role": "All-Rounder",
    "battingPosition": 7,
    "allowedSlots": [5, 6, 7],
    "batRating": 78,
    "powRating": 82,
    "bwlRating": 89
  },
  {
    "id": "rr_08",
    "name": "Sam Curran",
    "team": "RR",
    "role": "All-Rounder",
    "battingPosition": 6,
    "allowedSlots": [5, 6, 7, 8],
    "batRating": 79,
    "powRating": 85,
    "bwlRating": 84
  },
  {
    "id": "rr_09",
    "name": "Dasun Shanaka",
    "team": "RR",
    "role": "All-Rounder",
    "battingPosition": 6,
    "allowedSlots": [5, 6, 7],
    "batRating": 73,
    "powRating": 86,
    "bwlRating": 68
  },
  {
    "id": "rr_10",
    "name": "Donovan Ferreira",
    "team": "RR",
    "role": "All-Rounder",
    "battingPosition": 5,
    "allowedSlots": [5, 6, 7],
    "batRating": 72,
    "powRating": 89,
    "bwlRating": 58
  },
  {
    "id": "rr_11",
    "name": "Jofra Archer",
    "team": "RR",
    "role": "Bowler",
    "battingPosition": 9,
    "allowedSlots": [8, 9, 10, 11],
    "batRating": 45,
    "powRating": 65,
    "bwlRating": 90
  },
  {
    "id": "rr_12",
    "name": "Nandre Burger",
    "team": "RR",
    "role": "Bowler",
    "battingPosition": 11,
    "allowedSlots": [9, 10, 11],
    "batRating": 15,
    "powRating": 22,
    "bwlRating": 85
  },
  {
    "id": "rr_13",
    "name": "Adam Milne",
    "team": "RR",
    "role": "Bowler",
    "battingPosition": 10,
    "allowedSlots": [9, 10, 11],
    "batRating": 20,
    "powRating": 30,
    "bwlRating": 82
  },
  {
    "id": "rr_14",
    "name": "Kwena Maphaka",
    "team": "RR",
    "role": "Bowler",
    "battingPosition": 11,
    "allowedSlots": [9, 10, 11],
    "batRating": 10,
    "powRating": 15,
    "bwlRating": 81
  },
  {
    "id": "srh_01",
    "name": "Travis Head",
    "team": "SRH",
    "role": "Batter",
    "battingPosition": 1,
    "allowedSlots": [1, 2],
    "batRating": 86,
    "powRating": 96,
    "bwlRating": 20
  },
  {
    "id": "srh_02",
    "name": "Aniket Verma",
    "team": "SRH",
    "role": "Batter",
    "battingPosition": 4,
    "allowedSlots": [3, 4],
    "batRating": 72,
    "powRating": 78,
    "bwlRating": 5
  },
  {
    "id": "srh_03",
    "name": "Ravichandran Smaran",
    "team": "SRH",
    "role": "Batter",
    "battingPosition": 3,
    "allowedSlots": [3, 4],
    "batRating": 68,
    "powRating": 74,
    "bwlRating": 5
  },
  {
    "id": "srh_04",
    "name": "Ishan Kishan",
    "team": "SRH",
    "role": "WK",
    "battingPosition": 1,
    "allowedSlots": [1, 2, 3],
    "batRating": 82,
    "powRating": 89,
    "bwlRating": 5
  },
  {
    "id": "srh_05",
    "name": "Heinrich Klaasen",
    "team": "SRH",
    "role": "WK",
    "battingPosition": 5,
    "allowedSlots": [4, 5, 6],
    "batRating": 85,
    "powRating": 97,
    "bwlRating": 5
  },
  {
    "id": "srh_06",
    "name": "Abhishek Sharma",
    "team": "SRH",
    "role": "All-Rounder",
    "battingPosition": 1,
    "allowedSlots": [1, 2],
    "batRating": 83,
    "powRating": 94,
    "bwlRating": 60
  },
  {
    "id": "srh_07",
    "name": "Harsh Dubey",
    "team": "SRH",
    "role": "All-Rounder",
    "battingPosition": 6,
    "allowedSlots": [6, 7],
    "batRating": 62,
    "powRating": 68,
    "bwlRating": 65
  },
  {
    "id": "srh_08",
    "name": "Krains Fuletra",
    "team": "SRH",
    "role": "All-Rounder",
    "battingPosition": 6,
    "allowedSlots": [6, 7],
    "batRating": 66,
    "powRating": 72,
    "bwlRating": 62
  },
  {
    "id": "srh_09",
    "name": "Harshal Patel",
    "team": "SRH",
    "role": "All-Rounder",
    "battingPosition": 8,
    "allowedSlots": [7, 8, 9],
    "batRating": 45,
    "powRating": 65,
    "bwlRating": 86
  },
  {
    "id": "srh_10",
    "name": "Eshan Malinga",
    "team": "SRH",
    "role": "Bowler",
    "battingPosition": 10,
    "allowedSlots": [9, 10, 11],
    "batRating": 15,
    "powRating": 20,
    "bwlRating": 75
  },
  {
    "id": "srh_11",
    "name": "Pat Cummins",
    "team": "SRH",
    "role": "Bowler",
    "battingPosition": 8,
    "allowedSlots": [7, 8, 9, 10],
    "batRating": 58,
    "powRating": 78,
    "bwlRating": 90
  },
  {
    "id": "srh_12",
    "name": "David Payne",
    "team": "SRH",
    "role": "Bowler",
    "battingPosition": 11,
    "allowedSlots": [9, 10, 11],
    "batRating": 20,
    "powRating": 28,
    "bwlRating": 81
  },
  {
    "id": "srh_13",
    "name": "Sakib Hussain",
    "team": "SRH",
    "role": "Bowler",
    "battingPosition": 10,
    "allowedSlots": [9, 10, 11],
    "batRating": 15,
    "powRating": 20,
    "bwlRating": 76
  },
  {
    "id": "srh_14",
    "name": "Onkar Tarmale",
    "team": "SRH",
    "role": "Bowler",
    "battingPosition": 11,
    "allowedSlots": [9, 10, 11],
    "batRating": 15,
    "powRating": 22,
    "bwlRating": 72
  },
  {
    "id": "lsg_01",
    "name": "Himmat Singh",
    "team": "LSG",
    "role": "Batter",
    "battingPosition": 4,
    "allowedSlots": [3, 4, 5],
    "batRating": 75,
    "powRating": 78,
    "bwlRating": 5
  },
  {
    "id": "lsg_02",
    "name": "Ayush Badoni",
    "team": "LSG",
    "role": "Batter",
    "battingPosition": 5,
    "allowedSlots": [4, 5, 6],
    "batRating": 78,
    "powRating": 84,
    "bwlRating": 35
  },
  {
    "id": "lsg_03",
    "name": "Akshat Raghuvanshi",
    "team": "LSG",
    "role": "Batter",
    "battingPosition": 3,
    "allowedSlots": [3, 4, 5],
    "batRating": 72,
    "powRating": 76,
    "bwlRating": 5
  },
  {
    "id": "lsg_04",
    "name": "Matthew Breetzke",
    "team": "LSG",
    "role": "Batter",
    "battingPosition": 1,
    "allowedSlots": [1, 2, 3],
    "batRating": 78,
    "powRating": 85,
    "bwlRating": 5
  },
  {
    "id": "lsg_05",
    "name": "Rishabh Pant",
    "team": "LSG",
    "role": "WK",
    "battingPosition": 4,
    "allowedSlots": [3, 4, 5],
    "batRating": 88,
    "powRating": 90,
    "bwlRating": 5
  },
  {
    "id": "lsg_06",
    "name": "Nicholas Pooran",
    "team": "LSG",
    "role": "WK",
    "battingPosition": 5,
    "allowedSlots": [4, 5, 6],
    "batRating": 85,
    "powRating": 96,
    "bwlRating": 5
  },
  {
    "id": "lsg_07",
    "name": "Mitchell Marsh",
    "team": "LSG",
    "role": "All-Rounder",
    "battingPosition": 3,
    "allowedSlots": [1, 2, 3],
    "batRating": 82,
    "powRating": 89,
    "bwlRating": 72
  },
  {
    "id": "lsg_08",
    "name": "Arshin Kulkarni",
    "team": "LSG",
    "role": "All-Rounder",
    "battingPosition": 2,
    "allowedSlots": [1, 2, 3],
    "batRating": 72,
    "powRating": 78,
    "bwlRating": 64
  },
  {
    "id": "lsg_09",
    "name": "Shahbaz Ahmed",
    "team": "LSG",
    "role": "All-Rounder",
    "battingPosition": 7,
    "allowedSlots": [6, 7, 8],
    "batRating": 72,
    "powRating": 78,
    "bwlRating": 78
  },
  {
    "id": "lsg_10",
    "name": "Wanindu Hasaranga",
    "team": "LSG",
    "role": "All-Rounder",
    "battingPosition": 7,
    "allowedSlots": [7, 8, 9],
    "batRating": 68,
    "powRating": 78,
    "bwlRating": 92
  },
  {
    "id": "lsg_11",
    "name": "Akash Singh",
    "team": "LSG",
    "role": "Bowler",
    "battingPosition": 11,
    "allowedSlots": [9, 10, 11],
    "batRating": 15,
    "powRating": 20,
    "bwlRating": 78
  },
  {
    "id": "lsg_12",
    "name": "Avesh Khan",
    "team": "LSG",
    "role": "Bowler",
    "battingPosition": 10,
    "allowedSlots": [9, 10, 11],
    "batRating": 15,
    "powRating": 28,
    "bwlRating": 84
  },
  {
    "id": "lsg_13",
    "name": "Mohammed Shami",
    "team": "LSG",
    "role": "Bowler",
    "battingPosition": 9,
    "allowedSlots": [9, 10, 11],
    "batRating": 20,
    "powRating": 35,
    "bwlRating": 92
  },
  {
    "id": "lsg_14",
    "name": "Prince Yadav",
    "team": "LSG",
    "role": "Bowler",
    "battingPosition": 11,
    "allowedSlots": [9, 10, 11],
    "batRating": 15,
    "powRating": 20,
    "bwlRating": 72
  },
  {
    "id": "dc_01",
    "name": "Prithvi Shaw",
    "team": "DC",
    "role": "Batter",
    "battingPosition": 1,
    "allowedSlots": [1, 2],
    "batRating": 78,
    "powRating": 88,
    "bwlRating": 5
  },
  {
    "id": "dc_02",
    "name": "Pathum Nissanka",
    "team": "DC",
    "role": "Batter",
    "battingPosition": 2,
    "allowedSlots": [1, 2, 3],
    "batRating": 84,
    "powRating": 84,
    "bwlRating": 5
  },
  {
    "id": "dc_03",
    "name": "David Miller",
    "team": "DC",
    "role": "Batter",
    "battingPosition": 5,
    "allowedSlots": [4, 5, 6],
    "batRating": 83,
    "powRating": 91,
    "bwlRating": 5
  },
  {
    "id": "dc_04",
    "name": "Karun Nair",
    "team": "DC",
    "role": "Batter",
    "battingPosition": 3,
    "allowedSlots": [3, 4],
    "batRating": 78,
    "powRating": 76,
    "bwlRating": 12
  },
  {
    "id": "dc_05",
    "name": "Abhishek Porel",
    "team": "DC",
    "role": "WK",
    "battingPosition": 3,
    "allowedSlots": [1, 2, 3],
    "batRating": 79,
    "powRating": 87,
    "bwlRating": 5
  },
  {
    "id": "dc_06",
    "name": "KL Rahul",
    "team": "DC",
    "role": "WK",
    "battingPosition": 1,
    "allowedSlots": [1, 2, 3],
    "batRating": 88,
    "powRating": 85,
    "bwlRating": 5
  },
  {
    "id": "dc_07",
    "name": "Axar Patel",
    "team": "DC",
    "role": "All-Rounder",
    "battingPosition": 7,
    "allowedSlots": [5, 6, 7],
    "batRating": 79,
    "powRating": 84,
    "bwlRating": 88
  },
  {
    "id": "dc_08",
    "name": "Sameer Rizvi",
    "team": "DC",
    "role": "All-Rounder",
    "battingPosition": 5,
    "allowedSlots": [4, 5, 6],
    "batRating": 76,
    "powRating": 86,
    "bwlRating": 15
  },
  {
    "id": "dc_09",
    "name": "Ashutosh Sharma",
    "team": "DC",
    "role": "All-Rounder",
    "battingPosition": 6,
    "allowedSlots": [5, 6, 7],
    "batRating": 75,
    "powRating": 94,
    "bwlRating": 15
  },
  {
    "id": "dc_10",
    "name": "Ajay Mandal",
    "team": "DC",
    "role": "All-Rounder",
    "battingPosition": 8,
    "allowedSlots": [7, 8],
    "batRating": 65,
    "powRating": 72,
    "bwlRating": 68
  },
  {
    "id": "dc_11",
    "name": "Vipraj Nigam",
    "team": "DC",
    "role": "Bowler",
    "battingPosition": 10,
    "allowedSlots": [9, 10, 11],
    "batRating": 15,
    "powRating": 22,
    "bwlRating": 72
  },
  {
    "id": "dc_12",
    "name": "Tripurana Vijay",
    "team": "DC",
    "role": "Bowler",
    "battingPosition": 11,
    "allowedSlots": [9, 10, 11],
    "batRating": 15,
    "powRating": 20,
    "bwlRating": 68
  },
  {
    "id": "dc_13",
    "name": "Mukesh Kumar",
    "team": "DC",
    "role": "Bowler",
    "battingPosition": 10,
    "allowedSlots": [9, 10, 11],
    "batRating": 10,
    "powRating": 15,
    "bwlRating": 84
  },
  {
    "id": "dc_14",
    "name": "Kuldeep Yadav",
    "team": "DC",
    "role": "Bowler",
    "battingPosition": 9,
    "allowedSlots": [9, 10, 11],
    "batRating": 25,
    "powRating": 32,
    "bwlRating": 92
  },
  {
    "id": "pbks_01",
    "name": "Shreyas Iyer",
    "team": "PBKS",
    "role": "Batter",
    "battingPosition": 3,
    "allowedSlots": [3, 4],
    "batRating": 87,
    "powRating": 82,
    "bwlRating": 15
  },
  {
    "id": "pbks_02",
    "name": "Priyansh Arya",
    "team": "PBKS",
    "role": "Batter",
    "battingPosition": 1,
    "allowedSlots": [1, 2, 3],
    "batRating": 75,
    "powRating": 84,
    "bwlRating": 10
  },
  {
    "id": "pbks_03",
    "name": "Harnoor Singh",
    "team": "PBKS",
    "role": "Batter",
    "battingPosition": 2,
    "allowedSlots": [1, 2, 3],
    "batRating": 74,
    "powRating": 78,
    "bwlRating": 10
  },
  {
    "id": "pbks_04",
    "name": "Pyla Avinash",
    "team": "PBKS",
    "role": "Batter",
    "battingPosition": 4,
    "allowedSlots": [3, 4, 5],
    "batRating": 68,
    "powRating": 72,
    "bwlRating": 5
  },
  {
    "id": "pbks_05",
    "name": "Vishnu Vinod",
    "team": "PBKS",
    "role": "WK",
    "battingPosition": 5,
    "allowedSlots": [4, 5, 6],
    "batRating": 72,
    "powRating": 84,
    "bwlRating": 5
  },
  {
    "id": "pbks_06",
    "name": "Prabhsimran Singh",
    "team": "PBKS",
    "role": "WK",
    "battingPosition": 1,
    "allowedSlots": [1, 2, 3],
    "batRating": 79,
    "powRating": 87,
    "bwlRating": 5
  },
  {
    "id": "pbks_07",
    "name": "Marco Jansen",
    "team": "PBKS",
    "role": "All-Rounder",
    "battingPosition": 8,
    "allowedSlots": [7, 8, 9],
    "batRating": 66,
    "powRating": 84,
    "bwlRating": 84
  },
  {
    "id": "pbks_08",
    "name": "Cooper Connolly",
    "team": "PBKS",
    "role": "All-Rounder",
    "battingPosition": 6,
    "allowedSlots": [5, 6, 7],
    "batRating": 74,
    "powRating": 79,
    "bwlRating": 72
  },
  {
    "id": "pbks_09",
    "name": "Mitchell Owen",
    "team": "PBKS",
    "role": "All-Rounder",
    "battingPosition": 6,
    "allowedSlots": [5, 6, 7],
    "batRating": 72,
    "powRating": 78,
    "bwlRating": 68
  },
  {
    "id": "pbks_10",
    "name": "Marcus Stoinis",
    "team": "PBKS",
    "role": "All-Rounder",
    "battingPosition": 5,
    "allowedSlots": [4, 5, 6],
    "batRating": 82,
    "powRating": 89,
    "bwlRating": 74
  },
  {
    "id": "pbks_11",
    "name": "Arshdeep Singh",
    "team": "PBKS",
    "role": "Bowler",
    "battingPosition": 10,
    "allowedSlots": [9, 10, 11],
    "batRating": 15,
    "powRating": 25,
    "bwlRating": 89
  },
  {
    "id": "pbks_12",
    "name": "Yuzvendra Chahal",
    "team": "PBKS",
    "role": "Bowler",
    "battingPosition": 11,
    "allowedSlots": [10, 11],
    "batRating": 10,
    "powRating": 10,
    "bwlRating": 90
  },
  {
    "id": "pbks_13",
    "name": "Harpreet Brar",
    "team": "PBKS",
    "role": "Bowler",
    "battingPosition": 8,
    "allowedSlots": [7, 8, 9],
    "batRating": 58,
    "powRating": 68,
    "bwlRating": 81
  },
  {
    "id": "pbks_14",
    "name": "Vishal Nishad",
    "team": "PBKS",
    "role": "Bowler",
    "battingPosition": 11,
    "allowedSlots": [9, 10, 11],
    "batRating": 15,
    "powRating": 20,
    "bwlRating": 68
  }
];

export const MOCK_PLAYERS: Player[] = PLAYERS.slice(0, 20);

// ============================================================
// HELPERS — convenient views over the player pool
// ============================================================

export const FRANCHISE_CODES = [...new Set(PLAYERS.map((p) => p.team))].sort();

export function getPlayerById(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id);
}

export function getPlayersByRole(role: Player['role']): Player[] {
  return PLAYERS.filter((p) => p.role === role);
}

export function getPlayersByTeam(team: string): Player[] {
  return PLAYERS.filter((p) => p.team === team);
}

export function getStarRating(player: Player): number {
  switch (player.role) {
    case 'Batter':
    case 'WK':
      return Math.round(player.batRating * 0.5 + player.powRating * 0.4 + player.bwlRating * 0.1);
    case 'All-Rounder':
      return Math.round(player.batRating * 0.3 + player.powRating * 0.3 + player.bwlRating * 0.4);
    case 'Bowler':
      return Math.round(player.batRating * 0.1 + player.powRating * 0.1 + player.bwlRating * 0.8);
    default:
      return Math.round((player.batRating + player.powRating + player.bwlRating) / 3);
  }
}

export function getFranchiseColor(team: string): string {
  const colors: Record<string, string> = {
    MI:   '#004BA0',
    CSK:  '#F9CD05',
    RCB:  '#EC1C24',
    KKR:  '#3A225D',
    DC:   '#004C93',
    RR:   '#EA1A85',
    SRH:  '#FF822A',
    PBKS: '#ED1B24',
    LSG:  '#A72056',
    GT:   '#1C1C2B',
  };
  return colors[team] ?? '#6366f1';
}

export function getFranchiseName(code: string): string {
  const names: Record<string, string> = {
    MI:   'Mumbai Indians',
    CSK:  'Chennai Super Kings',
    RCB:  'Royal Challengers Bengaluru',
    KKR:  'Kolkata Knight Riders',
    DC:   'Delhi Capitals',
    RR:   'Rajasthan Royals',
    SRH:  'Sunrisers Hyderabad',
    PBKS: 'Punjab Kings',
    LSG:  'Lucknow Super Giants',
    GT:   'Gujarat Titans',
  };
  return names[code] ?? code;
}

export function formatSlotRange(slots: number[]): string {
  if (slots.length === 0) return '';
  if (slots.length === 1) return String(slots[0]);

  const sorted = [...slots].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? String(start) : `${start}-${end}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? String(start) : `${start}-${end}`);
  return ranges.join(', ');
}