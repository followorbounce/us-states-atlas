/* ============================================================
   All 50 U.S. states + the District of Columbia (51 entities).

   Sourcing (real, WebFetch-verified, not recalled-from-memory):
   - population: US Census Bureau estimate, July 1 2025 (via
     Wikipedia's "List of states and territories of the United
     States by population").
   - totalAreaKm2, capital, statehood: via Wikipedia's "List of
     states and territories of the United States".
   - gdpNominalUSD, gdpPerCapitaUSD: US Bureau of Economic Analysis,
     2024 (via Wikipedia's "List of U.S. states and territories by
     GDP", itself sourced from BEA).
   - largestCity: general reference knowledge (stable, well-known
     fact for every state) — NOT independently web-verified the way
     the four numeric/date fields above were.
   - gridX/gridY: the "tile grid map" position used to render the
     schematic map (see js/gridlayout.js) — real published
     coordinates from kristw/gridmap-layout-usa (MIT licensed), not
     invented. A tile grid map was used instead of a true geographic
     map because reproducing accurate state-border SVG path data
     from memory would risk real distortion; a tile grid is an
     established, honest cartographic technique for exactly this
     tradeoff (each state gets equal visual weight, approximate real
     layout, no fabricated coastlines).
   ============================================================ */
const States = [
  { id: "alabama", abbr: "AL", name: "Alabama", gridX: 6, gridY: 6, capital: "Montgomery", largestCity: "Huntsville", statehood: "Dec 14, 1819", population: 5193088, totalAreaKm2: 135767, gdpNominalUSD: 341154e6, gdpPerCapitaUSD: 65694 },
  { id: "alaska", abbr: "AK", name: "Alaska", gridX: 0, gridY: 0, capital: "Juneau", largestCity: "Anchorage", statehood: "Jan 3, 1959", population: 737270, totalAreaKm2: 1723337, gdpNominalUSD: 75012e6, gdpPerCapitaUSD: 101742 },
  { id: "arizona", abbr: "AZ", name: "Arizona", gridX: 2, gridY: 5, capital: "Phoenix", largestCity: "Phoenix", statehood: "Feb 14, 1912", population: 7623818, totalAreaKm2: 295234, gdpNominalUSD: 598189e6, gdpPerCapitaUSD: 78463 },
  { id: "arkansas", abbr: "AR", name: "Arkansas", gridX: 5, gridY: 5, capital: "Little Rock", largestCity: "Little Rock", statehood: "Jun 15, 1836", population: 3114791, totalAreaKm2: 137732, gdpNominalUSD: 198422e6, gdpPerCapitaUSD: 63703 },
  { id: "california", abbr: "CA", name: "California", gridX: 0, gridY: 4, capital: "Sacramento", largestCity: "Los Angeles", statehood: "Sep 9, 1850", population: 39355309, totalAreaKm2: 423967, gdpNominalUSD: 4250841e6, gdpPerCapitaUSD: 108012 },
  { id: "colorado", abbr: "CO", name: "Colorado", gridX: 3, gridY: 4, capital: "Denver", largestCity: "Denver", statehood: "Aug 1, 1876", population: 6012561, totalAreaKm2: 269601, gdpNominalUSD: 584324e6, gdpPerCapitaUSD: 97184 },
  { id: "connecticut", abbr: "CT", name: "Connecticut", gridX: 10, gridY: 2, capital: "Hartford", largestCity: "Bridgeport", statehood: "Jan 9, 1788", population: 3688496, totalAreaKm2: 14357, gdpNominalUSD: 376455e6, gdpPerCapitaUSD: 102062 },
  { id: "delaware", abbr: "DE", name: "Delaware", gridX: 10, gridY: 4, capital: "Dover", largestCity: "Wilmington", statehood: "Dec 7, 1787", population: 1059952, totalAreaKm2: 6446, gdpNominalUSD: 117218e6, gdpPerCapitaUSD: 110588 },
  { id: "district-of-columbia", abbr: "DC", name: "District of Columbia", gridX: 8, gridY: 4, capital: "—", largestCity: "Washington", statehood: "Jul 16, 1790 (federal district, not a state)", population: 693645, totalAreaKm2: 176, gdpNominalUSD: 192618e6, gdpPerCapitaUSD: 277689 },
  { id: "florida", abbr: "FL", name: "Florida", gridX: 7, gridY: 7, capital: "Tallahassee", largestCity: "Jacksonville", statehood: "Mar 3, 1845", population: 23462518, totalAreaKm2: 170312, gdpNominalUSD: 1834641e6, gdpPerCapitaUSD: 78195 },
  { id: "georgia", abbr: "GA", name: "Georgia", gridX: 7, gridY: 6, capital: "Atlanta", largestCity: "Atlanta", statehood: "Jan 2, 1788", population: 11302748, totalAreaKm2: 153910, gdpNominalUSD: 924829e6, gdpPerCapitaUSD: 81823 },
  { id: "hawaii", abbr: "HI", name: "Hawaii", gridX: 0, gridY: 7, capital: "Honolulu", largestCity: "Honolulu", statehood: "Aug 21, 1959", population: 1432820, totalAreaKm2: 28313, gdpNominalUSD: 124608e6, gdpPerCapitaUSD: 86967 },
  { id: "idaho", abbr: "ID", name: "Idaho", gridX: 2, gridY: 3, capital: "Boise", largestCity: "Boise", statehood: "Jul 3, 1890", population: 2029733, totalAreaKm2: 216443, gdpNominalUSD: 135553e6, gdpPerCapitaUSD: 66784 },
  { id: "illinois", abbr: "IL", name: "Illinois", gridX: 6, gridY: 3, capital: "Springfield", largestCity: "Chicago", statehood: "Dec 3, 1818", population: 12719141, totalAreaKm2: 149995, gdpNominalUSD: 1201996e6, gdpPerCapitaUSD: 94503 },
  { id: "indiana", abbr: "IN", name: "Indiana", gridX: 7, gridY: 3, capital: "Indianapolis", largestCity: "Indianapolis", statehood: "Dec 11, 1816", population: 6973333, totalAreaKm2: 94326, gdpNominalUSD: 545234e6, gdpPerCapitaUSD: 78188 },
  { id: "iowa", abbr: "IA", name: "Iowa", gridX: 5, gridY: 3, capital: "Des Moines", largestCity: "Des Moines", statehood: "Dec 28, 1846", population: 3238387, totalAreaKm2: 145746, gdpNominalUSD: 277110e6, gdpPerCapitaUSD: 85570 },
  { id: "kansas", abbr: "KS", name: "Kansas", gridX: 4, gridY: 4, capital: "Topeka", largestCity: "Wichita", statehood: "Jan 29, 1861", population: 2977220, totalAreaKm2: 213100, gdpNominalUSD: 241378e6, gdpPerCapitaUSD: 81075 },
  { id: "kentucky", abbr: "KY", name: "Kentucky", gridX: 6, gridY: 4, capital: "Frankfort", largestCity: "Louisville", statehood: "Jun 1, 1792", population: 4606864, totalAreaKm2: 104656, gdpNominalUSD: 306897e6, gdpPerCapitaUSD: 66617 },
  { id: "louisiana", abbr: "LA", name: "Louisiana", gridX: 4, gridY: 6, capital: "Baton Rouge", largestCity: "New Orleans", statehood: "Apr 30, 1812", population: 4618789, totalAreaKm2: 135659, gdpNominalUSD: 340080e6, gdpPerCapitaUSD: 73639 },
  { id: "maine", abbr: "ME", name: "Maine", gridX: 11, gridY: 0, capital: "Augusta", largestCity: "Portland", statehood: "Mar 15, 1820", population: 1414874, totalAreaKm2: 91633, gdpNominalUSD: 102844e6, gdpPerCapitaUSD: 72688 },
  { id: "maryland", abbr: "MD", name: "Maryland", gridX: 9, gridY: 4, capital: "Annapolis", largestCity: "Baltimore", statehood: "Apr 28, 1788", population: 6265347, totalAreaKm2: 32131, gdpNominalUSD: 568140e6, gdpPerCapitaUSD: 90680 },
  { id: "massachusetts", abbr: "MA", name: "Massachusetts", gridX: 11, gridY: 1, capital: "Boston", largestCity: "Boston", statehood: "Feb 6, 1788", population: 7154084, totalAreaKm2: 27336, gdpNominalUSD: 820105e6, gdpPerCapitaUSD: 114635 },
  { id: "michigan", abbr: "MI", name: "Michigan", gridX: 7, gridY: 2, capital: "Lansing", largestCity: "Detroit", statehood: "Jan 26, 1837", population: 10127884, totalAreaKm2: 250487, gdpNominalUSD: 730068e6, gdpPerCapitaUSD: 72085 },
  { id: "minnesota", abbr: "MN", name: "Minnesota", gridX: 5, gridY: 2, capital: "Saint Paul", largestCity: "Minneapolis", statehood: "May 11, 1858", population: 5830405, totalAreaKm2: 225163, gdpNominalUSD: 531465e6, gdpPerCapitaUSD: 91154 },
  { id: "mississippi", abbr: "MS", name: "Mississippi", gridX: 5, gridY: 6, capital: "Jackson", largestCity: "Jackson", statehood: "Dec 10, 1817", population: 2954160, totalAreaKm2: 125438, gdpNominalUSD: 165069e6, gdpPerCapitaUSD: 55877 },
  { id: "missouri", abbr: "MO", name: "Missouri", gridX: 5, gridY: 4, capital: "Jefferson City", largestCity: "Kansas City", statehood: "Aug 10, 1821", population: 6270541, totalAreaKm2: 180540, gdpNominalUSD: 468470e6, gdpPerCapitaUSD: 74710 },
  { id: "montana", abbr: "MT", name: "Montana", gridX: 2, gridY: 2, capital: "Helena", largestCity: "Billings", statehood: "Nov 8, 1889", population: 1144694, totalAreaKm2: 380831, gdpNominalUSD: 82358e6, gdpPerCapitaUSD: 71947 },
  { id: "nebraska", abbr: "NE", name: "Nebraska", gridX: 4, gridY: 3, capital: "Lincoln", largestCity: "Omaha", statehood: "Mar 1, 1867", population: 2018006, totalAreaKm2: 200330, gdpNominalUSD: 198073e6, gdpPerCapitaUSD: 98153 },
  { id: "nevada", abbr: "NV", name: "Nevada", gridX: 1, gridY: 4, capital: "Carson City", largestCity: "Las Vegas", statehood: "Oct 31, 1864", population: 3282188, totalAreaKm2: 286380, gdpNominalUSD: 281454e6, gdpPerCapitaUSD: 85752 },
  { id: "new-hampshire", abbr: "NH", name: "New Hampshire", gridX: 10, gridY: 1, capital: "Concord", largestCity: "Manchester", statehood: "Jun 21, 1788", population: 1415342, totalAreaKm2: 24214, gdpNominalUSD: 125523e6, gdpPerCapitaUSD: 88688 },
  { id: "new-jersey", abbr: "NJ", name: "New Jersey", gridX: 10, gridY: 3, capital: "Trenton", largestCity: "Newark", statehood: "Dec 18, 1787", population: 9548215, totalAreaKm2: 22591, gdpNominalUSD: 887175e6, gdpPerCapitaUSD: 92915 },
  { id: "new-mexico", abbr: "NM", name: "New Mexico", gridX: 3, gridY: 5, capital: "Santa Fe", largestCity: "Albuquerque", statehood: "Jan 6, 1912", population: 2125498, totalAreaKm2: 314917, gdpNominalUSD: 152779e6, gdpPerCapitaUSD: 71879 },
  { id: "new-york", abbr: "NY", name: "New York", gridX: 9, gridY: 2, capital: "Albany", largestCity: "New York City", statehood: "Jul 26, 1788", population: 20002427, totalAreaKm2: 141297, gdpNominalUSD: 2467674e6, gdpPerCapitaUSD: 123369 },
  { id: "north-carolina", abbr: "NC", name: "North Carolina", gridX: 8, gridY: 5, capital: "Raleigh", largestCity: "Charlotte", statehood: "Nov 21, 1789", population: 11197968, totalAreaKm2: 139391, gdpNominalUSD: 893763e6, gdpPerCapitaUSD: 79815 },
  { id: "north-dakota", abbr: "ND", name: "North Dakota", gridX: 3, gridY: 2, capital: "Bismarck", largestCity: "Fargo", statehood: "Nov 2, 1889", population: 799358, totalAreaKm2: 183108, gdpNominalUSD: 81883e6, gdpPerCapitaUSD: 102436 },
  { id: "ohio", abbr: "OH", name: "Ohio", gridX: 8, gridY: 3, capital: "Columbus", largestCity: "Columbus", statehood: "Mar 1, 1803", population: 11900510, totalAreaKm2: 116098, gdpNominalUSD: 966780e6, gdpPerCapitaUSD: 81239 },
  { id: "oklahoma", abbr: "OK", name: "Oklahoma", gridX: 4, gridY: 5, capital: "Oklahoma City", largestCity: "Oklahoma City", statehood: "Nov 16, 1907", population: 4123288, totalAreaKm2: 181037, gdpNominalUSD: 274421e6, gdpPerCapitaUSD: 66554 },
  { id: "oregon", abbr: "OR", name: "Oregon", gridX: 1, gridY: 3, capital: "Salem", largestCity: "Portland", statehood: "Feb 14, 1859", population: 4273586, totalAreaKm2: 254799, gdpNominalUSD: 342850e6, gdpPerCapitaUSD: 80225 },
  { id: "pennsylvania", abbr: "PA", name: "Pennsylvania", gridX: 9, gridY: 3, capital: "Harrisburg", largestCity: "Philadelphia", statehood: "Dec 12, 1787", population: 13059432, totalAreaKm2: 119280, gdpNominalUSD: 1056446e6, gdpPerCapitaUSD: 80895 },
  { id: "rhode-island", abbr: "RI", name: "Rhode Island", gridX: 11, gridY: 2, capital: "Providence", largestCity: "Providence", statehood: "May 29, 1790", population: 1114521, totalAreaKm2: 4001, gdpNominalUSD: 83956e6, gdpPerCapitaUSD: 75329 },
  { id: "south-carolina", abbr: "SC", name: "South Carolina", gridX: 8, gridY: 6, capital: "Columbia", largestCity: "Charleston", statehood: "May 23, 1788", population: 5570274, totalAreaKm2: 82933, gdpNominalUSD: 378831e6, gdpPerCapitaUSD: 68009 },
  { id: "south-dakota", abbr: "SD", name: "South Dakota", gridX: 4, gridY: 2, capital: "Pierre", largestCity: "Sioux Falls", statehood: "Nov 2, 1889", population: 935094, totalAreaKm2: 199729, gdpNominalUSD: 80650e6, gdpPerCapitaUSD: 86248 },
  { id: "tennessee", abbr: "TN", name: "Tennessee", gridX: 6, gridY: 5, capital: "Nashville", largestCity: "Nashville", statehood: "Jun 1, 1796", population: 7315076, totalAreaKm2: 109153, gdpNominalUSD: 589818e6, gdpPerCapitaUSD: 80630 },
  { id: "texas", abbr: "TX", name: "Texas", gridX: 3, gridY: 6, capital: "Austin", largestCity: "Houston", statehood: "Dec 29, 1845", population: 31709821, totalAreaKm2: 695662, gdpNominalUSD: 2904428e6, gdpPerCapitaUSD: 91594 },
  { id: "utah", abbr: "UT", name: "Utah", gridX: 2, gridY: 4, capital: "Salt Lake City", largestCity: "Salt Lake City", statehood: "Jan 4, 1896", population: 3538904, totalAreaKm2: 219882, gdpNominalUSD: 315973e6, gdpPerCapitaUSD: 89286 },
  { id: "vermont", abbr: "VT", name: "Vermont", gridX: 9, gridY: 1, capital: "Montpelier", largestCity: "Burlington", statehood: "Mar 4, 1791", population: 644663, totalAreaKm2: 24906, gdpNominalUSD: 48350e6, gdpPerCapitaUSD: 75001 },
  { id: "virginia", abbr: "VA", name: "Virginia", gridX: 7, gridY: 5, capital: "Richmond", largestCity: "Virginia Beach", statehood: "Jun 25, 1788", population: 8880107, totalAreaKm2: 110787, gdpNominalUSD: 798448e6, gdpPerCapitaUSD: 89914 },
  { id: "washington", abbr: "WA", name: "Washington", gridX: 1, gridY: 2, capital: "Olympia", largestCity: "Seattle", statehood: "Nov 11, 1889", population: 8001020, totalAreaKm2: 184661, gdpNominalUSD: 894990e6, gdpPerCapitaUSD: 111860 },
  { id: "west-virginia", abbr: "WV", name: "West Virginia", gridX: 7, gridY: 4, capital: "Charleston", largestCity: "Charleston", statehood: "Jun 20, 1863", population: 1766147, totalAreaKm2: 62756, gdpNominalUSD: 109277e6, gdpPerCapitaUSD: 61873 },
  { id: "wisconsin", abbr: "WI", name: "Wisconsin", gridX: 6, gridY: 2, capital: "Madison", largestCity: "Milwaukee", statehood: "May 29, 1848", population: 5972787, totalAreaKm2: 169635, gdpNominalUSD: 473037e6, gdpPerCapitaUSD: 79199 },
  { id: "wyoming", abbr: "WY", name: "Wyoming", gridX: 3, gridY: 3, capital: "Cheyenne", largestCity: "Cheyenne", statehood: "Jul 10, 1890", population: 588753, totalAreaKm2: 253335, gdpNominalUSD: 52622e6, gdpPerCapitaUSD: 89379 },
];
