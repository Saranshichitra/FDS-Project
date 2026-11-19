(function startKnnSite() {
  // A preview tool may execute this file more than once in the same page.
  if (window.knnSiteStarted) return
  window.knnSiteStarted = true

  const { decisionGrid, kNearest, vote } = window.KNN

const CLASS_INFO = {
  A: { name: 'Group A', color: '#4F9DFF', shape: 'circle' },
  B: { name: 'Group B', color: '#FF9F4A', shape: 'triangle' },
  C: { name: 'Group C', color: '#5FD38D', shape: 'square' },
}

const DATASETS = {
  'Two groups': { centers: [[.32, .38], [.68, .64]], labels: ['A', 'B'], amount: 32, spread: .17 },
  'Overlapping groups': { centers: [[.38, .44], [.62, .57]], labels: ['A', 'B'], amount: 35, spread: .24 },
  'Three groups': { centers: [[.28, .32], [.72, .35], [.51, .72]], labels: ['A', 'B', 'C'], amount: 27, spread: .16 },
}

// Filtered rows from Pokemon.csv: Water, Fire, and Grass primary types.
// Each row stores the Pokemon name, Attack, Defense, and type label.
const POKEMON_ROWS = [
  {"name":"Bulbasaur","form":"","attack":49,"defense":49,"label":"C"},
  {"name":"Ivysaur","form":"","attack":62,"defense":63,"label":"C"},
  {"name":"Venusaur","form":"","attack":82,"defense":83,"label":"C"},
  {"name":"Charmander","form":"","attack":52,"defense":43,"label":"B"},
  {"name":"Charmeleon","form":"","attack":64,"defense":58,"label":"B"},
  {"name":"Charizard","form":"","attack":84,"defense":78,"label":"B"},
  {"name":"Squirtle","form":"","attack":48,"defense":65,"label":"A"},
  {"name":"Wartortle","form":"","attack":63,"defense":80,"label":"A"},
  {"name":"Blastoise","form":"","attack":83,"defense":100,"label":"A"},
  {"name":"Vulpix","form":"","attack":41,"defense":40,"label":"B"},
  {"name":"Ninetales","form":"","attack":76,"defense":75,"label":"B"},
  {"name":"Oddish","form":"","attack":50,"defense":55,"label":"C"},
  {"name":"Gloom","form":"","attack":65,"defense":70,"label":"C"},
  {"name":"Vileplume","form":"","attack":80,"defense":85,"label":"C"},
  {"name":"Psyduck","form":"","attack":52,"defense":48,"label":"A"},
  {"name":"Golduck","form":"","attack":82,"defense":78,"label":"A"},
  {"name":"Growlithe","form":"","attack":70,"defense":45,"label":"B"},
  {"name":"Arcanine","form":"","attack":110,"defense":80,"label":"B"},
  {"name":"Poliwag","form":"","attack":50,"defense":40,"label":"A"},
  {"name":"Poliwhirl","form":"","attack":65,"defense":65,"label":"A"},
  {"name":"Poliwrath","form":"","attack":95,"defense":95,"label":"A"},
  {"name":"Bellsprout","form":"","attack":75,"defense":35,"label":"C"},
  {"name":"Weepinbell","form":"","attack":90,"defense":50,"label":"C"},
  {"name":"Victreebel","form":"","attack":105,"defense":65,"label":"C"},
  {"name":"Tentacool","form":"","attack":40,"defense":35,"label":"A"},
  {"name":"Tentacruel","form":"","attack":70,"defense":65,"label":"A"},
  {"name":"Ponyta","form":"","attack":85,"defense":55,"label":"B"},
  {"name":"Rapidash","form":"","attack":100,"defense":70,"label":"B"},
  {"name":"Slowpoke","form":"","attack":65,"defense":65,"label":"A"},
  {"name":"Slowbro","form":"","attack":75,"defense":110,"label":"A"},
  {"name":"Seel","form":"","attack":45,"defense":55,"label":"A"},
  {"name":"Dewgong","form":"","attack":70,"defense":80,"label":"A"},
  {"name":"Shellder","form":"","attack":65,"defense":100,"label":"A"},
  {"name":"Cloyster","form":"","attack":95,"defense":180,"label":"A"},
  {"name":"Krabby","form":"","attack":105,"defense":90,"label":"A"},
  {"name":"Kingler","form":"","attack":130,"defense":115,"label":"A"},
  {"name":"Exeggcute","form":"","attack":40,"defense":80,"label":"C"},
  {"name":"Exeggutor","form":"","attack":95,"defense":85,"label":"C"},
  {"name":"Tangela","form":"","attack":55,"defense":115,"label":"C"},
  {"name":"Horsea","form":"","attack":40,"defense":70,"label":"A"},
  {"name":"Seadra","form":"","attack":65,"defense":95,"label":"A"},
  {"name":"Goldeen","form":"","attack":67,"defense":60,"label":"A"},
  {"name":"Seaking","form":"","attack":92,"defense":65,"label":"A"},
  {"name":"Staryu","form":"","attack":45,"defense":55,"label":"A"},
  {"name":"Starmie","form":"","attack":75,"defense":85,"label":"A"},
  {"name":"Magmar","form":"","attack":95,"defense":57,"label":"B"},
  {"name":"Magikarp","form":"","attack":10,"defense":55,"label":"A"},
  {"name":"Gyarados","form":"","attack":125,"defense":79,"label":"A"},
  {"name":"Lapras","form":"","attack":85,"defense":80,"label":"A"},
  {"name":"Vaporeon","form":"","attack":65,"defense":60,"label":"A"},
  {"name":"Flareon","form":"","attack":130,"defense":60,"label":"B"},
  {"name":"Moltres","form":"","attack":100,"defense":90,"label":"B"},
  {"name":"Chikorita","form":"","attack":49,"defense":65,"label":"C"},
  {"name":"Bayleef","form":"","attack":62,"defense":80,"label":"C"},
  {"name":"Meganium","form":"","attack":82,"defense":100,"label":"C"},
  {"name":"Cyndaquil","form":"","attack":52,"defense":43,"label":"B"},
  {"name":"Quilava","form":"","attack":64,"defense":58,"label":"B"},
  {"name":"Typhlosion","form":"","attack":84,"defense":78,"label":"B"},
  {"name":"Totodile","form":"","attack":65,"defense":64,"label":"A"},
  {"name":"Croconaw","form":"","attack":80,"defense":80,"label":"A"},
  {"name":"Feraligatr","form":"","attack":105,"defense":100,"label":"A"},
  {"name":"Chinchou","form":"","attack":38,"defense":38,"label":"A"},
  {"name":"Lanturn","form":"","attack":58,"defense":58,"label":"A"},
  {"name":"Bellossom","form":"","attack":80,"defense":95,"label":"C"},
  {"name":"Marill","form":"","attack":20,"defense":50,"label":"A"},
  {"name":"Azumarill","form":"","attack":50,"defense":80,"label":"A"},
  {"name":"Politoed","form":"","attack":75,"defense":75,"label":"A"},
  {"name":"Hoppip","form":"","attack":35,"defense":40,"label":"C"},
  {"name":"Skiploom","form":"","attack":45,"defense":50,"label":"C"},
  {"name":"Jumpluff","form":"","attack":55,"defense":70,"label":"C"},
  {"name":"Sunkern","form":"","attack":30,"defense":30,"label":"C"},
  {"name":"Sunflora","form":"","attack":75,"defense":55,"label":"C"},
  {"name":"Wooper","form":"","attack":45,"defense":45,"label":"A"},
  {"name":"Quagsire","form":"","attack":85,"defense":85,"label":"A"},
  {"name":"Slowking","form":"","attack":75,"defense":80,"label":"A"},
  {"name":"Qwilfish","form":"","attack":95,"defense":85,"label":"A"},
  {"name":"Slugma","form":"","attack":40,"defense":40,"label":"B"},
  {"name":"Magcargo","form":"","attack":50,"defense":120,"label":"B"},
  {"name":"Corsola","form":"","attack":55,"defense":95,"label":"A"},
  {"name":"Remoraid","form":"","attack":65,"defense":35,"label":"A"},
  {"name":"Octillery","form":"","attack":105,"defense":75,"label":"A"},
  {"name":"Mantine","form":"","attack":40,"defense":70,"label":"A"},
  {"name":"Kingdra","form":"","attack":95,"defense":95,"label":"A"},
  {"name":"Magby","form":"","attack":75,"defense":37,"label":"B"},
  {"name":"Entei","form":"","attack":115,"defense":85,"label":"B"},
  {"name":"Suicune","form":"","attack":75,"defense":115,"label":"A"},
  {"name":"Ho-oh","form":"","attack":130,"defense":90,"label":"B"},
  {"name":"Treecko","form":"","attack":45,"defense":35,"label":"C"},
  {"name":"Grovyle","form":"","attack":65,"defense":45,"label":"C"},
  {"name":"Sceptile","form":"","attack":85,"defense":65,"label":"C"},
  {"name":"Torchic","form":"","attack":60,"defense":40,"label":"B"},
  {"name":"Combusken","form":"","attack":85,"defense":60,"label":"B"},
  {"name":"Blaziken","form":"","attack":120,"defense":70,"label":"B"},
  {"name":"Mudkip","form":"","attack":70,"defense":50,"label":"A"},
  {"name":"Marshtomp","form":"","attack":85,"defense":70,"label":"A"},
  {"name":"Swampert","form":"","attack":110,"defense":90,"label":"A"},
  {"name":"Lotad","form":"","attack":30,"defense":30,"label":"A"},
  {"name":"Lombre","form":"","attack":50,"defense":50,"label":"A"},
  {"name":"Ludicolo","form":"","attack":70,"defense":70,"label":"A"},
  {"name":"Seedot","form":"","attack":40,"defense":50,"label":"C"},
  {"name":"Nuzleaf","form":"","attack":70,"defense":40,"label":"C"},
  {"name":"Shiftry","form":"","attack":100,"defense":60,"label":"C"},
  {"name":"Wingull","form":"","attack":30,"defense":30,"label":"A"},
  {"name":"Pelipper","form":"","attack":50,"defense":100,"label":"A"},
  {"name":"Shroomish","form":"","attack":40,"defense":60,"label":"C"},
  {"name":"Breloom","form":"","attack":130,"defense":80,"label":"C"},
  {"name":"Roselia","form":"","attack":60,"defense":45,"label":"C"},
  {"name":"Carvanha","form":"","attack":90,"defense":20,"label":"A"},
  {"name":"Sharpedo","form":"","attack":120,"defense":40,"label":"A"},
  {"name":"Wailmer","form":"","attack":70,"defense":35,"label":"A"},
  {"name":"Wailord","form":"","attack":90,"defense":45,"label":"A"},
  {"name":"Numel","form":"","attack":60,"defense":40,"label":"B"},
  {"name":"Camerupt","form":"","attack":100,"defense":70,"label":"B"},
  {"name":"Torkoal","form":"","attack":85,"defense":140,"label":"B"},
  {"name":"Cacnea","form":"","attack":85,"defense":40,"label":"C"},
  {"name":"Cacturne","form":"","attack":115,"defense":60,"label":"C"},
  {"name":"Barboach","form":"","attack":48,"defense":43,"label":"A"},
  {"name":"Whiscash","form":"","attack":78,"defense":73,"label":"A"},
  {"name":"Corphish","form":"","attack":80,"defense":65,"label":"A"},
  {"name":"Crawdaunt","form":"","attack":120,"defense":85,"label":"A"},
  {"name":"Feebas","form":"","attack":15,"defense":20,"label":"A"},
  {"name":"Milotic","form":"","attack":60,"defense":79,"label":"A"},
  {"name":"Castform","form":"Sunny Form","attack":70,"defense":70,"label":"B"},
  {"name":"Castform","form":"Rainy Form","attack":70,"defense":70,"label":"A"},
  {"name":"Tropius","form":"","attack":68,"defense":83,"label":"C"},
  {"name":"Clamperl","form":"","attack":64,"defense":85,"label":"A"},
  {"name":"Huntail","form":"","attack":104,"defense":105,"label":"A"},
  {"name":"Gorebyss","form":"","attack":84,"defense":105,"label":"A"},
  {"name":"Relicanth","form":"","attack":90,"defense":130,"label":"A"},
  {"name":"Luvdisc","form":"","attack":30,"defense":55,"label":"A"},
  {"name":"Kyogre","form":"","attack":100,"defense":90,"label":"A"},
  {"name":"Turtwig","form":"","attack":68,"defense":64,"label":"C"},
  {"name":"Grotle","form":"","attack":89,"defense":85,"label":"C"},
  {"name":"Torterra","form":"","attack":109,"defense":105,"label":"C"},
  {"name":"Chimchar","form":"","attack":58,"defense":44,"label":"B"},
  {"name":"Monferno","form":"","attack":78,"defense":52,"label":"B"},
  {"name":"Infernape","form":"","attack":104,"defense":71,"label":"B"},
  {"name":"Piplup","form":"","attack":51,"defense":53,"label":"A"},
  {"name":"Prinplup","form":"","attack":66,"defense":68,"label":"A"},
  {"name":"Empoleon","form":"","attack":86,"defense":88,"label":"A"},
  {"name":"Budew","form":"","attack":30,"defense":35,"label":"C"},
  {"name":"Roserade","form":"","attack":70,"defense":65,"label":"C"},
  {"name":"Buizel","form":"","attack":65,"defense":35,"label":"A"},
  {"name":"Floatzel","form":"","attack":105,"defense":55,"label":"A"},
  {"name":"Cherubi","form":"","attack":35,"defense":45,"label":"C"},
  {"name":"Cherrim","form":"","attack":60,"defense":70,"label":"C"},
  {"name":"Shellos","form":"","attack":48,"defense":48,"label":"A"},
  {"name":"Gastrodon","form":"","attack":83,"defense":68,"label":"A"},
  {"name":"Carnivine","form":"","attack":100,"defense":72,"label":"C"},
  {"name":"Finneon","form":"","attack":49,"defense":56,"label":"A"},
  {"name":"Lumineon","form":"","attack":69,"defense":76,"label":"A"},
  {"name":"Mantyke","form":"","attack":20,"defense":50,"label":"A"},
  {"name":"Snover","form":"","attack":62,"defense":50,"label":"C"},
  {"name":"Abomasnow","form":"","attack":92,"defense":75,"label":"C"},
  {"name":"Tangrowth","form":"","attack":100,"defense":125,"label":"C"},
  {"name":"Magmortar","form":"","attack":95,"defense":67,"label":"B"},
  {"name":"Leafeon","form":"","attack":110,"defense":130,"label":"C"},
  {"name":"Palkia","form":"","attack":120,"defense":100,"label":"A"},
  {"name":"Heatran","form":"","attack":90,"defense":106,"label":"B"},
  {"name":"Phione","form":"","attack":80,"defense":80,"label":"A"},
  {"name":"Manaphy","form":"","attack":100,"defense":100,"label":"A"},
  {"name":"Shaymin","form":"Land Forme","attack":100,"defense":100,"label":"C"},
  {"name":"Shaymin","form":"Sky Forme","attack":103,"defense":75,"label":"C"},
  {"name":"Snivy","form":"","attack":45,"defense":55,"label":"C"},
  {"name":"Servine","form":"","attack":60,"defense":75,"label":"C"},
  {"name":"Serperior","form":"","attack":75,"defense":95,"label":"C"},
  {"name":"Tepig","form":"","attack":63,"defense":45,"label":"B"},
  {"name":"Pignite","form":"","attack":93,"defense":55,"label":"B"},
  {"name":"Emboar","form":"","attack":123,"defense":65,"label":"B"},
  {"name":"Oshawott","form":"","attack":55,"defense":45,"label":"A"},
  {"name":"Dewott","form":"","attack":75,"defense":60,"label":"A"},
  {"name":"Samurott","form":"","attack":100,"defense":85,"label":"A"},
  {"name":"Pansage","form":"","attack":53,"defense":48,"label":"C"},
  {"name":"Simisage","form":"","attack":98,"defense":63,"label":"C"},
  {"name":"Pansear","form":"","attack":53,"defense":48,"label":"B"},
  {"name":"Simisear","form":"","attack":98,"defense":63,"label":"B"},
  {"name":"Panpour","form":"","attack":53,"defense":48,"label":"A"},
  {"name":"Simipour","form":"","attack":98,"defense":63,"label":"A"},
  {"name":"Tympole","form":"","attack":50,"defense":40,"label":"A"},
  {"name":"Palpitoad","form":"","attack":65,"defense":55,"label":"A"},
  {"name":"Seismitoad","form":"","attack":95,"defense":75,"label":"A"},
  {"name":"Cottonee","form":"","attack":27,"defense":60,"label":"C"},
  {"name":"Whimsicott","form":"","attack":67,"defense":85,"label":"C"},
  {"name":"Petilil","form":"","attack":35,"defense":50,"label":"C"},
  {"name":"Lilligant","form":"","attack":60,"defense":75,"label":"C"},
  {"name":"Basculin","form":"Red-Striped Form","attack":92,"defense":65,"label":"A"},
  {"name":"Basculin","form":"Blue-Striped Form","attack":92,"defense":65,"label":"A"},
  {"name":"Darumaka","form":"","attack":90,"defense":45,"label":"B"},
  {"name":"Darmanitan","form":"Standard Mode","attack":140,"defense":55,"label":"B"},
  {"name":"Darmanitan","form":"Zen Mode","attack":30,"defense":105,"label":"B"},
  {"name":"Maractus","form":"","attack":86,"defense":67,"label":"C"},
  {"name":"Tirtouga","form":"","attack":78,"defense":103,"label":"A"},
  {"name":"Carracosta","form":"","attack":108,"defense":133,"label":"A"},
  {"name":"Ducklett","form":"","attack":44,"defense":50,"label":"A"},
  {"name":"Swanna","form":"","attack":87,"defense":63,"label":"A"},
  {"name":"Foongus","form":"","attack":55,"defense":45,"label":"C"},
  {"name":"Amoonguss","form":"","attack":85,"defense":70,"label":"C"},
  {"name":"Frillish","form":"","attack":40,"defense":50,"label":"A"},
  {"name":"Jellicent","form":"","attack":60,"defense":70,"label":"A"},
  {"name":"Alomomola","form":"","attack":75,"defense":80,"label":"A"},
  {"name":"Ferroseed","form":"","attack":50,"defense":91,"label":"C"},
  {"name":"Ferrothorn","form":"","attack":94,"defense":131,"label":"C"},
  {"name":"Heatmor","form":"","attack":97,"defense":66,"label":"B"},
  {"name":"Virizion","form":"","attack":90,"defense":72,"label":"C"},
  {"name":"Keldeo","form":"Ordinary Form","attack":72,"defense":90,"label":"A"},
  {"name":"Keldeo","form":"Resolute Form","attack":72,"defense":90,"label":"A"},
  {"name":"Venusaur","form":"Mega Venusaur","attack":100,"defense":123,"label":"C"},
  {"name":"Charizard","form":"Mega Charizard X","attack":130,"defense":111,"label":"B"},
  {"name":"Charizard","form":"Mega Charizard Y","attack":104,"defense":78,"label":"B"},
  {"name":"Blastoise","form":"Mega Blastoise","attack":103,"defense":120,"label":"A"},
  {"name":"Slowbro","form":"Mega Slowbro","attack":75,"defense":180,"label":"A"},
  {"name":"Gyarados","form":"Mega Gyarados","attack":155,"defense":109,"label":"A"},
  {"name":"Sceptile","form":"Mega Sceptile","attack":110,"defense":75,"label":"C"},
  {"name":"Blaziken","form":"Mega Blaziken","attack":160,"defense":80,"label":"B"},
  {"name":"Swampert","form":"Mega Swampert","attack":150,"defense":110,"label":"A"},
  {"name":"Sharpedo","form":"Mega Sharpedo","attack":140,"defense":70,"label":"A"},
  {"name":"Camerupt","form":"Mega Camerupt","attack":120,"defense":100,"label":"B"},
  {"name":"Kyogre","form":"Primal Kyogre","attack":150,"defense":90,"label":"A"},
  {"name":"Abomasnow","form":"Mega Abomasnow","attack":132,"defense":105,"label":"C"},
  {"name":"Chespin","form":"","attack":61,"defense":65,"label":"C"},
  {"name":"Quilladin","form":"","attack":78,"defense":95,"label":"C"},
  {"name":"Chesnaught","form":"","attack":107,"defense":122,"label":"C"},
  {"name":"Fennekin","form":"","attack":45,"defense":40,"label":"B"},
  {"name":"Braixen","form":"","attack":59,"defense":58,"label":"B"},
  {"name":"Delphox","form":"","attack":69,"defense":72,"label":"B"},
  {"name":"Froakie","form":"","attack":56,"defense":40,"label":"A"},
  {"name":"Frogadier","form":"","attack":63,"defense":52,"label":"A"},
  {"name":"Greninja","form":"","attack":95,"defense":67,"label":"A"},
  {"name":"Fletchinder","form":"","attack":73,"defense":55,"label":"B"},
  {"name":"Talonflame","form":"","attack":81,"defense":71,"label":"B"},
  {"name":"Litleo","form":"","attack":50,"defense":58,"label":"B"},
  {"name":"Pyroar","form":"","attack":68,"defense":72,"label":"B"},
  {"name":"Skiddo","form":"","attack":65,"defense":48,"label":"C"},
  {"name":"Gogoat","form":"","attack":100,"defense":62,"label":"C"},
  {"name":"Clauncher","form":"","attack":53,"defense":62,"label":"A"},
  {"name":"Clawitzer","form":"","attack":73,"defense":88,"label":"A"},
  {"name":"Volcanion","form":"","attack":110,"defense":120,"label":"B"},
  {"name":"Exeggutor","form":"Alolan Exeggutor","attack":105,"defense":85,"label":"C"},
  {"name":"Marowak","form":"Alolan Marowak","attack":80,"defense":110,"label":"B"},
  {"name":"Greninja","form":"Ash-Greninja","attack":145,"defense":67,"label":"A"},
  {"name":"Rowlet","form":"","attack":55,"defense":55,"label":"C"},
  {"name":"Dartrix","form":"","attack":75,"defense":75,"label":"C"},
  {"name":"Decidueye","form":"","attack":107,"defense":75,"label":"C"},
  {"name":"Litten","form":"","attack":65,"defense":40,"label":"B"},
  {"name":"Torracat","form":"","attack":85,"defense":50,"label":"B"},
  {"name":"Incineroar","form":"","attack":115,"defense":90,"label":"B"},
  {"name":"Popplio","form":"","attack":54,"defense":54,"label":"A"},
  {"name":"Brionne","form":"","attack":69,"defense":69,"label":"A"},
  {"name":"Primarina","form":"","attack":74,"defense":74,"label":"A"},
  {"name":"Oricorio","form":"Baile Style","attack":70,"defense":70,"label":"B"},
  {"name":"Wishiwashi","form":"Solo Form","attack":20,"defense":20,"label":"A"},
  {"name":"Wishiwashi","form":"School Form","attack":140,"defense":130,"label":"A"},
  {"name":"Dewpider","form":"","attack":40,"defense":52,"label":"A"},
  {"name":"Araquanid","form":"","attack":70,"defense":92,"label":"A"},
  {"name":"Fomantis","form":"","attack":55,"defense":35,"label":"C"},
  {"name":"Lurantis","form":"","attack":105,"defense":90,"label":"C"},
  {"name":"Morelull","form":"","attack":35,"defense":55,"label":"C"},
  {"name":"Shiinotic","form":"","attack":45,"defense":80,"label":"C"},
  {"name":"Bounsweet","form":"","attack":30,"defense":38,"label":"C"},
  {"name":"Steenee","form":"","attack":40,"defense":48,"label":"C"},
  {"name":"Tsareena","form":"","attack":120,"defense":98,"label":"C"},
  {"name":"Pyukumuku","form":"","attack":60,"defense":130,"label":"A"},
  {"name":"Turtonator","form":"","attack":78,"defense":135,"label":"B"},
  {"name":"Bruxish","form":"","attack":105,"defense":70,"label":"A"},
  {"name":"Tapu Bulu","form":"","attack":130,"defense":115,"label":"C"},
  {"name":"Tapu Fini","form":"","attack":75,"defense":115,"label":"A"},
  {"name":"Kartana","form":"","attack":181,"defense":131,"label":"C"},
  {"name":"Blacephalon","form":"","attack":127,"defense":53,"label":"B"},
  {"name":"Growlithe","form":"Hisuian Growlithe","attack":75,"defense":45,"label":"B"},
  {"name":"Arcanine","form":"Hisuian Arcanine","attack":115,"defense":80,"label":"B"},
  {"name":"Typhlosion","form":"Hisuian Typhlosion","attack":84,"defense":78,"label":"B"},
  {"name":"Palkia","form":"Origin Forme","attack":100,"defense":100,"label":"A"},
  {"name":"Samurott","form":"Hisuian Samurott","attack":108,"defense":80,"label":"A"},
  {"name":"Lilligant","form":"Hisuian Lilligant","attack":105,"defense":75,"label":"C"},
  {"name":"Basculin","form":"White-Striped Form","attack":92,"defense":65,"label":"A"},
  {"name":"Decidueye","form":"Hisuian Decidueye","attack":112,"defense":80,"label":"C"},
  {"name":"Grookey","form":"","attack":65,"defense":50,"label":"C"},
  {"name":"Thwackey","form":"","attack":85,"defense":70,"label":"C"},
  {"name":"Rillaboom","form":"","attack":125,"defense":90,"label":"C"},
  {"name":"Scorbunny","form":"","attack":71,"defense":40,"label":"B"},
  {"name":"Raboot","form":"","attack":86,"defense":60,"label":"B"},
  {"name":"Cinderace","form":"","attack":116,"defense":75,"label":"B"},
  {"name":"Sobble","form":"","attack":40,"defense":40,"label":"A"},
  {"name":"Drizzile","form":"","attack":60,"defense":55,"label":"A"},
  {"name":"Inteleon","form":"","attack":85,"defense":65,"label":"A"},
  {"name":"Gossifleur","form":"","attack":40,"defense":60,"label":"C"},
  {"name":"Eldegoss","form":"","attack":50,"defense":90,"label":"C"},
  {"name":"Chewtle","form":"","attack":64,"defense":50,"label":"A"},
  {"name":"Drednaw","form":"","attack":115,"defense":90,"label":"A"},
  {"name":"Applin","form":"","attack":40,"defense":80,"label":"C"},
  {"name":"Flapple","form":"","attack":110,"defense":80,"label":"C"},
  {"name":"Appletun","form":"","attack":85,"defense":80,"label":"C"},
  {"name":"Arrokuda","form":"","attack":63,"defense":40,"label":"A"},
  {"name":"Barraskewda","form":"","attack":123,"defense":60,"label":"A"},
  {"name":"Sizzlipede","form":"","attack":65,"defense":45,"label":"B"},
  {"name":"Centiskorch","form":"","attack":115,"defense":65,"label":"B"},
  {"name":"Dracovish","form":"","attack":90,"defense":100,"label":"A"},
  {"name":"Arctovish","form":"","attack":90,"defense":100,"label":"A"},
  {"name":"Basculegion","form":"Male","attack":112,"defense":65,"label":"A"},
  {"name":"Basculegion","form":"Female","attack":92,"defense":65,"label":"A"},
  {"name":"Sprigatito","form":"","attack":61,"defense":54,"label":"C"},
  {"name":"Floragato","form":"","attack":80,"defense":63,"label":"C"},
  {"name":"Meowscarada","form":"","attack":110,"defense":70,"label":"C"},
  {"name":"Fuecoco","form":"","attack":45,"defense":59,"label":"B"},
  {"name":"Crocalor","form":"","attack":55,"defense":78,"label":"B"},
  {"name":"Skeledirge","form":"","attack":75,"defense":100,"label":"B"},
  {"name":"Quaxly","form":"","attack":65,"defense":45,"label":"A"},
  {"name":"Quaxwell","form":"","attack":85,"defense":65,"label":"A"},
  {"name":"Quaquaval","form":"","attack":120,"defense":80,"label":"A"},
  {"name":"Smoliv","form":"","attack":35,"defense":45,"label":"C"},
  {"name":"Dolliv","form":"","attack":53,"defense":60,"label":"C"},
  {"name":"Arboliva","form":"","attack":69,"defense":90,"label":"C"},
  {"name":"Charcadet","form":"","attack":50,"defense":40,"label":"B"},
  {"name":"Armarouge","form":"","attack":60,"defense":100,"label":"B"},
  {"name":"Ceruledge","form":"","attack":125,"defense":80,"label":"B"},
  {"name":"Bramblin","form":"","attack":65,"defense":30,"label":"C"},
  {"name":"Brambleghast","form":"","attack":115,"defense":70,"label":"C"},
  {"name":"Capsakid","form":"","attack":62,"defense":40,"label":"C"},
  {"name":"Scovillain","form":"","attack":108,"defense":65,"label":"C"},
  {"name":"Wiglett","form":"","attack":55,"defense":25,"label":"A"},
  {"name":"Wugtrio","form":"","attack":100,"defense":50,"label":"A"},
  {"name":"Finizen","form":"","attack":45,"defense":40,"label":"A"},
  {"name":"Palafin","form":"Zero Form","attack":70,"defense":72,"label":"A"},
  {"name":"Palafin","form":"Hero Form","attack":160,"defense":97,"label":"A"},
  {"name":"Veluza","form":"","attack":102,"defense":73,"label":"A"},
  {"name":"Dondozo","form":"","attack":100,"defense":115,"label":"A"},
  {"name":"Brute Bonnet","form":"","attack":127,"defense":99,"label":"C"},
  {"name":"Iron Moth","form":"","attack":70,"defense":60,"label":"B"},
  {"name":"Walking Wake","form":"","attack":83,"defense":91,"label":"A"},
  {"name":"Iron Leaves","form":"","attack":130,"defense":88,"label":"C"},
  {"name":"Dipplin","form":"","attack":80,"defense":110,"label":"C"},
  {"name":"Poltchageist","form":"","attack":45,"defense":45,"label":"C"},
  {"name":"Sinistcha","form":"","attack":60,"defense":106,"label":"C"},
  {"name":"Ogerpon","form":"Teal Mask","attack":120,"defense":84,"label":"C"},
  {"name":"Ogerpon","form":"Wellspring Mask","attack":120,"defense":84,"label":"C"},
  {"name":"Ogerpon","form":"Hearthflame Mask","attack":120,"defense":84,"label":"C"},
  {"name":"Ogerpon","form":"Cornerstone Mask","attack":120,"defense":84,"label":"C"},
  {"name":"Hydrapple","form":"","attack":80,"defense":110,"label":"C"},
  {"name":"Gouging Fire","form":"","attack":115,"defense":121,"label":"B"}
]

const DEFAULT_GROUP_NAMES = { A: 'Group A', B: 'Group B', C: 'Group C' }

const INITIAL_QUERY = { x: .4, y: .4 }
const SVG_WIDTH = 720
const SVG_HEIGHT = 440
const INSET = 38
const INNER_WIDTH = SVG_WIDTH - INSET * 2
const INNER_HEIGHT = SVG_HEIGHT - INSET * 2
const LINE_DRAW_SECONDS = .5
const MEASURE_LINE_STAGGER = .018
const NEIGHBOR_LINE_STAGGER = .5
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

const elements = {
  svg: document.getElementById('scatter'),
  badge: document.getElementById('plot-badge'),
  explanation: document.getElementById('explanation'),
  play: document.getElementById('play-button'),
  dataset: document.getElementById('dataset-select'),
  reset: document.getElementById('reset-button'),
  pageDescription: document.getElementById('page-description'),
  kRange: document.getElementById('k-range'),
  kValue: document.getElementById('k-value'),
  ticks: document.getElementById('slider-ticks'),
  speedRange: document.getElementById('speed-range'),
  speedValue: document.getElementById('speed-value'),
  zoomOut: document.getElementById('zoom-out'),
  zoomIn: document.getElementById('zoom-in'),
  zoomReset: document.getElementById('zoom-reset'),
  zoomValue: document.getElementById('zoom-value'),
  regions: document.getElementById('regions-toggle'),
  legend: document.getElementById('legend'),
  neighbours: document.getElementById('neighbour-list'),
  vote: document.getElementById('vote-wrap'),
  live: document.getElementById('result-live'),
}

const state = {
  dataset: 'Two groups',
  points: makeData('Two groups'),
  groupNames: { ...DEFAULT_GROUP_NAMES },
  featureNames: ['Feature 1', 'Feature 2'],
  featureRanges: { x: [0, 1], y: [0, 1] },
  query: { ...INITIAL_QUERY },
  k: 5,
  metric: 'euclidean',
  regions: false,
  speed: 1,
  zoom: 1,
  zoomCenter: { x: .5, y: .5 },
  step: 0,
  playing: false,
  dragging: false,
  panning: false,
  panStart: null,
  playbackTimer: null,
}

function seededRandom(seed) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function makeData(name) {
  const { centers, labels, amount, spread } = DATASETS[name]
  const random = seededRandom(name.length * 9157 + 11)
  return centers.flatMap(([cx, cy], group) => Array.from({ length: amount }, (_, index) => {
    const angle = random() * Math.PI * 2
    const radius = (random() + random() + random()) / 3 * spread
    return {
      id: `${name}-${labels[group]}-${index}`,
      x: Math.max(.035, Math.min(.965, cx + Math.cos(angle) * radius)),
      y: Math.max(.035, Math.min(.965, cy + Math.sin(angle) * radius)),
      label: labels[group],
    }
  }))
}

function makePokemonData() {
  const attackValues = POKEMON_ROWS.map((pokemon) => pokemon.attack)
  const defenseValues = POKEMON_ROWS.map((pokemon) => pokemon.defense)
  const minAttack = Math.min(...attackValues)
  const maxAttack = Math.max(...attackValues)
  const minDefense = Math.min(...defenseValues)
  const maxDefense = Math.max(...defenseValues)
  state.featureRanges = {
    x: [minAttack, maxAttack],
    y: [minDefense, maxDefense],
  }

  return POKEMON_ROWS.map((pokemon, index) => ({
    id: `pokemon-${index}`,
    name: pokemon.name,
    form: pokemon.form,
    attack: pokemon.attack,
    defense: pokemon.defense,
    x: (pokemon.attack - minAttack) / (maxAttack - minAttack),
    y: (pokemon.defense - minDefense) / (maxDefense - minDefense),
    label: pokemon.label,
  }))
}

function groupName(label) {
  return state.groupNames[label] || CLASS_INFO[label].name
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

function changeDataset(name) {
  state.dataset = name
  if (name === 'pokemon') {
    state.points = makePokemonData()
    state.groupNames = { A: 'Water', B: 'Fire', C: 'Grass' }
    state.featureNames = ['Attack', 'Defense']
  } else {
    state.points = makeData(name)
    state.groupNames = { ...DEFAULT_GROUP_NAMES }
    state.featureNames = ['Feature 1', 'Feature 2']
    state.featureRanges = { x: [0, 1], y: [0, 1] }
  }
  state.query = { ...INITIAL_QUERY }
  state.zoom = 1
  state.zoomCenter = { x: .5, y: .5 }
  stopPlayback()
  render()
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function getViewBounds() {
  const span = 1 / state.zoom
  return {
    minX: state.zoomCenter.x - span / 2,
    maxX: state.zoomCenter.x + span / 2,
    minY: state.zoomCenter.y - span / 2,
    maxY: state.zoomCenter.y + span / 2,
    width: span,
    height: span,
  }
}

function px(x) {
  const view = getViewBounds()
  return INSET + (x - view.minX) / view.width * INNER_WIDTH
}

function py(y) {
  const view = getViewBounds()
  return SVG_HEIGHT - INSET - (y - view.minY) / view.height * INNER_HEIGHT
}

function plotX(fraction) { return INSET + fraction * INNER_WIDTH }
function plotY(fraction) { return SVG_HEIGHT - INSET - fraction * INNER_HEIGHT }

function svgMarker(point, size, opacity) {
  const color = CLASS_INFO[point.label].color
  const x = px(point.x)
  const y = py(point.y)
  const titleText = point.name
    ? `${point.name}${point.form ? ` (${point.form})` : ''}: ${groupName(point.label)}, Attack ${point.attack}, Defense ${point.defense}`
    : groupName(point.label)
  const title = `<title>${escapeHtml(titleText)}</title>`
  if (CLASS_INFO[point.label].shape === 'triangle') {
    return `<path d="M ${x} ${y - size} L ${x + size} ${y + size} L ${x - size} ${y + size} Z" fill="${color}" opacity="${opacity}">${title}</path>`
  }
  if (CLASS_INFO[point.label].shape === 'square') {
    return `<rect x="${x - size}" y="${y - size}" width="${size * 2}" height="${size * 2}" rx="2" fill="${color}" opacity="${opacity}">${title}</rect>`
  }
  return `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="${opacity}">${title}</circle>`
}

function axisValue(range, fraction) {
  const value = range[0] + (range[1] - range[0]) * fraction
  return state.dataset === 'pokemon' ? String(Math.round(value)) : String(Number(value.toFixed(2)))
}

function drawPlot(neighbours, prediction) {
  const query = state.query
  const view = getViewBounds()
  const neighbourIds = new Set(neighbours.map((point) => point.id))
  const radius = neighbours.at(-1)?.distance ?? 0
  const gridLines = Array.from({ length: 5 }, (_, index) => {
    const position = index / 4
    return `<g>
      <line x1="${plotX(position)}" x2="${plotX(position)}" y1="${INSET}" y2="${SVG_HEIGHT - INSET}" class="grid-line" />
      <line x1="${INSET}" x2="${SVG_WIDTH - INSET}" y1="${plotY(position)}" y2="${plotY(position)}" class="grid-line" />
    </g>`
  }).join('')

  const xTicks = Array.from({ length: 5 }, (_, index) => {
    const fraction = index / 4
    const value = view.minX + fraction * view.width
    return `<text x="${plotX(fraction)}" y="${SVG_HEIGHT - INSET + 16}" text-anchor="middle">${axisValue(state.featureRanges.x, value)}</text>`
  }).join('')
  const yTicks = Array.from({ length: 5 }, (_, index) => {
    const fraction = 1 - index / 4
    const value = view.minY + fraction * view.height
    return `<text x="${INSET - 7}" y="${plotY(fraction) + 4}" text-anchor="end">${axisValue(state.featureRanges.y, value)}</text>`
  }).join('')

  const regions = state.regions
    ? decisionGrid(state.points, state.k, state.metric, 22, view).map((cell) => {
      const cellWidth = INNER_WIDTH / 22
      const cellHeight = INNER_HEIGHT / 22
      return `<rect x="${INSET + cell.col * cellWidth}" y="${INSET + cell.row * cellHeight}" width="${cellWidth + 1}" height="${cellHeight + 1}" fill="${CLASS_INFO[cell.label].color}" opacity=".14" />`
    }).join('')
    : ''

  // In the resting view, keep the lines to the nearest examples visible.
  // During step 1, show every distance; later steps narrow to the nearest k.
  const linePoints = state.step === 1
    ? kNearest(state.points, query, state.points.length, state.metric)
    : neighbours
  const lines = query ? linePoints.map((point, index) => {
    const animated = state.playing && state.step > 0 && state.step < 3
    const opacity = state.step === 1 ? (state.dataset === 'pokemon' ? .08 : .17) : .62
    const delay = prefersReducedMotion.matches ? 0 : state.step === 1
      ? index * MEASURE_LINE_STAGGER / state.speed
      : state.step === 2 ? index * NEIGHBOR_LINE_STAGGER / state.speed : 0
    const duration = prefersReducedMotion.matches ? .01 : LINE_DRAW_SECONDS / state.speed
    return `<line
      x1="${px(query.x)}" y1="${py(query.y)}" x2="${px(point.x)}" y2="${py(point.y)}"
      class="distance-line${animated ? ' is-animated' : ''}"
      style="--line-opacity:${opacity};--line-delay:${delay}s;--line-duration:${duration}s"
      pathLength="1" />`
  }).join('') : ''

  const markers = state.points.map((point) => {
    const selected = neighbourIds.has(point.id)
    const isPokemon = state.dataset === 'pokemon'
    const opacity = query && state.step !== 1 && !selected ? .28 : isPokemon ? .82 : .94
    return svgMarker(point, selected ? 6 : isPokemon ? 3.5 : 4.5, opacity)
  }).join('')

  const ring = query && radius && (state.step === 0 || state.step >= 2)
    ? `<ellipse cx="${px(query.x)}" cy="${py(query.y)}" rx="${radius * INNER_WIDTH / view.width}" ry="${radius * INNER_HEIGHT / view.height}" class="neighbor-radius" />`
    : ''

  const diamond = query
    ? `<g class="query-marker${state.playing && state.step === 3 ? ' is-popping' : ''}">
        <path d="M ${px(query.x)} ${py(query.y) - 11} L ${px(query.x) + 11} ${py(query.y)} L ${px(query.x)} ${py(query.y) + 11} L ${px(query.x) - 11} ${py(query.y)} Z" fill="#FFFFFF" stroke="#000000" stroke-width="2" />
        <circle cx="${px(query.x)}" cy="${py(query.y)}" r="13" fill="none" stroke="#FFFFFF" stroke-width="2" />
      </g>`
    : ''

  elements.svg.innerHTML = `
    <defs><clipPath id="graph-clip"><rect x="${INSET}" y="${INSET}" width="${INNER_WIDTH}" height="${INNER_HEIGHT}" rx="12" /></clipPath></defs>
    ${gridLines}
    <g clip-path="url(#graph-clip)">
      ${regions}${ring}${lines}${markers}${diamond}
    </g>
    <g class="axis-labels">
      <text x="${SVG_WIDTH / 2}" y="${SVG_HEIGHT - 3}" text-anchor="middle">${state.featureNames[0]}</text>
      <text x="13" y="${SVG_HEIGHT / 2}" text-anchor="middle" transform="rotate(-90 13 ${SVG_HEIGHT / 2})">${state.featureNames[1]}</text>
    </g>
    <g class="axis-ticks">${xTicks}${yTicks}</g>`

  const winner = CLASS_INFO[prediction.label]
  elements.badge.innerHTML = `<i style="background:${winner.color}"></i>${groupName(prediction.label)} wins ${prediction.counts[prediction.label]} of ${prediction.total}`
}

function renderLegend() {
  const labels = [...new Set(state.points.map((point) => point.label))]
  elements.legend.innerHTML = labels.map((label) => {
    return `<span><b class="legend-${label.toLowerCase()}"></b>${groupName(label)}</span>`
  }).join('') + '<span><b class="legend-query"></b>New point</span>'
}

function renderResults(neighbours, prediction) {
  elements.neighbours.innerHTML = neighbours.map((point, index) => {
    const info = CLASS_INFO[point.label]
    const fullName = point.name ? `${point.name}${point.form ? ` (${point.form})` : ''}` : groupName(point.label)
    const pointName = escapeHtml(fullName)
    const typeName = point.name ? `<span class="pokemon-type">${groupName(point.label)}</span>` : ''
    return `<div class="neighbour-row${state.playing && state.step === 2 ? ' is-entering' : ''}" style="--row-delay:${index * .07}s">
      <span class="rank-number">${index + 1}</span>
      <span class="shape-dot shape-${info.shape}" style="--marker:${info.color}"></span>
      <span class="neighbour-name">${pointName}</span>
      ${typeName}
      <span class="distance-number">${point.distance.toFixed(2)}</span>
    </div>`
  }).join('')

  const voteSegments = Object.entries(prediction.counts).map(([label, count]) => {
    const info = CLASS_INFO[label]
    const width = count / prediction.total * 100
    const voteDuration = prefersReducedMotion.matches ? .01 : LINE_DRAW_SECONDS / state.speed
    return `<span class="vote-piece${state.playing && state.step === 3 ? ' is-voting' : ''}" style="--piece-width:${width}%;--piece-color:${info.color};--vote-duration:${voteDuration}s"></span>`
  }).join('')
  const voteLegend = Object.entries(prediction.counts).map(([label, count]) => {
    const info = CLASS_INFO[label]
    return `<span><i style="background:${info.color}"></i>${groupName(label)}<strong>${count}</strong></span>`
  }).join('')
  elements.vote.innerHTML = `
    <div class="vote-heading"><span>Vote</span><span>${prediction.total} examples</span></div>
    <div class="vote-bar" role="img" aria-label="${Object.entries(prediction.counts).map(([label, count]) => `${groupName(label)}: ${count}`).join(', ')}">${voteSegments}</div>
    <div class="vote-legend">${voteLegend}</div>`
}

function explanationFor(prediction) {
  if (state.step === 1) return 'Measure: compare the new point with every example.'
  if (state.step === 2) return `Choose: keep the ${state.k} closest examples. Watch their lines connect one at a time.`
  if (state.step === 3) return `Vote: ${groupName(prediction.label)} has ${prediction.counts[prediction.label]} of ${prediction.total} votes.`
  if (state.dataset === 'pokemon') {
    return `${groupName(prediction.label)} is the predicted type. Drag the diamond or play the steps to see why.`
  }
  return `${groupName(prediction.label)} is the answer for this new point. Press Play the steps to see why.`
}

function render() {
  const neighbours = kNearest(state.points, state.query, state.k, state.metric)
  const prediction = vote(neighbours)
  const winner = groupName(prediction.label)

  elements.kRange.value = String(state.k)
  elements.kValue.value = String(state.k)
  elements.kValue.textContent = String(state.k)
  elements.ticks.querySelectorAll('[data-k]').forEach((button) => {
    button.classList.toggle('tick-active', Number(button.dataset.k) === state.k)
  })
  document.querySelectorAll('[data-metric]').forEach((button) => {
    const selected = button.dataset.metric === state.metric
    button.classList.toggle('selected', selected)
    button.setAttribute('aria-pressed', String(selected))
  })

  elements.speedRange.value = String(state.speed)
  const speedDescription = state.speed < 1 ? 'Slow' : state.speed === 1 ? 'Normal' : 'Fast'
  elements.speedValue.value = `${state.speed}× · ${speedDescription}`
  elements.speedValue.textContent = elements.speedValue.value
  elements.zoomValue.value = `${state.zoom.toFixed(1)}×`
  elements.zoomValue.textContent = elements.zoomValue.value
  elements.zoomOut.disabled = state.zoom <= 1
  elements.zoomIn.disabled = state.zoom >= 4
  elements.zoomReset.disabled = state.zoom <= 1
  elements.svg.classList.toggle('is-panning', state.panning)
  elements.regions.classList.toggle('toggle-on', state.regions)
  elements.regions.setAttribute('aria-checked', String(state.regions))

  elements.explanation.textContent = explanationFor(prediction)
  elements.pageDescription.textContent = state.dataset === 'pokemon'
    ? 'Attack goes left to right; Defense goes up. Nearby Pokémon vote on its type. Matching stats can overlap.'
    : 'Drag the diamond. Its closest examples vote for its group.'
  elements.play.disabled = state.playing
  elements.play.innerHTML = state.playing
    ? `Step ${state.step} of 3 · ${state.speed}×`
    : `${state.step === 3 ? 'Play again' : 'Play the steps'} <span aria-hidden="true">▶</span>`
  elements.live.textContent = `${winner} has ${prediction.counts[prediction.label]} of ${prediction.total} votes.`

  drawPlot(neighbours, prediction)
  renderLegend()
  renderResults(neighbours, prediction)
}

function stopPlayback() {
  window.clearTimeout(state.playbackTimer)
  state.playbackTimer = null
  state.playing = false
  state.step = 0
}

function scheduleNextStep() {
  window.clearTimeout(state.playbackTimer)
  let delay = 250
  if (!prefersReducedMotion.matches) {
    if (state.step === 1 || state.step === 2) {
      const lineCount = state.step === 1
        ? state.points.length
        : Math.min(state.k, state.points.length)
      const stagger = state.step === 1 ? MEASURE_LINE_STAGGER : NEIGHBOR_LINE_STAGGER
      delay = (Math.max(0, lineCount - 1) * stagger + LINE_DRAW_SECONDS) * 1000 / state.speed
    } else {
      delay = 700 / state.speed
    }
  }
  state.playbackTimer = window.setTimeout(() => {
    if (state.step >= 3) {
      state.playing = false
      state.playbackTimer = null
      render()
      return
    }
    state.step += 1
    render()
    scheduleNextStep()
  }, delay)
}

function startPlayback() {
  if (state.playing) return
  state.step = 1
  state.playing = true
  render()
  scheduleNextStep()
}

function zoomTo(nextZoom, focusX = .5, focusY = .5) {
  const zoom = Math.round(clamp(nextZoom, 1, 4) * 1000) / 1000
  if (zoom === state.zoom) return

  if (zoom === 1) {
    state.zoomCenter = { x: .5, y: .5 }
  } else {
    const view = getViewBounds()
    const anchorX = view.minX + focusX * view.width
    const anchorY = view.minY + focusY * view.height
    const span = 1 / zoom
    state.zoomCenter = {
      x: clamp(anchorX + (.5 - focusX) * span, span / 2, 1 - span / 2),
      y: clamp(anchorY + (.5 - focusY) * span, span / 2, 1 - span / 2),
    }
  }

  state.zoom = zoom
  stopPlayback()
  render()
}

function svgPosition(event) {
  const bounds = elements.svg.getBoundingClientRect()
  return {
    x: (event.clientX - bounds.left) / bounds.width * SVG_WIDTH,
    y: (event.clientY - bounds.top) / bounds.height * SVG_HEIGHT,
  }
}

function moveQuery(event) {
  const position = svgPosition(event)
  const view = getViewBounds()
  state.query = {
    x: view.minX + clamp((position.x - INSET) / INNER_WIDTH, 0, 1) * view.width,
    y: view.minY + clamp(1 - (position.y - INSET) / INNER_HEIGHT, 0, 1) * view.height,
  }
  stopPlayback()
  render()
}

function panGraph(event) {
  if (!state.panStart) return
  const bounds = elements.svg.getBoundingClientRect()
  const span = 1 / state.zoom
  const moveX = (event.clientX - state.panStart.pointerX) / bounds.width * SVG_WIDTH
  const moveY = (event.clientY - state.panStart.pointerY) / bounds.height * SVG_HEIGHT
  state.zoomCenter = {
    x: clamp(state.panStart.centerX - moveX / INNER_WIDTH * span, span / 2, 1 - span / 2),
    y: clamp(state.panStart.centerY + moveY / INNER_HEIGHT * span, span / 2, 1 - span / 2),
  }
  render()
}

elements.svg.addEventListener('wheel', (event) => {
  const position = svgPosition(event)
  const focusX = (position.x - INSET) / INNER_WIDTH
  const focusY = 1 - (position.y - INSET) / INNER_HEIGHT
  if (focusX < 0 || focusX > 1 || focusY < 0 || focusY > 1) return

  event.preventDefault()
  const zoomFactor = event.deltaY < 0 ? 1.2 : 1 / 1.2
  zoomTo(state.zoom * zoomFactor, focusX, focusY)
}, { passive: false })

elements.svg.addEventListener('pointerdown', (event) => {
  if (event.button === 2 && state.zoom > 1) {
    event.preventDefault()
    elements.svg.setPointerCapture(event.pointerId)
    stopPlayback()
    state.panning = true
    state.panStart = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      centerX: state.zoomCenter.x,
      centerY: state.zoomCenter.y,
    }
    render()
    return
  }
  if (event.button !== 0) return
  event.preventDefault()
  elements.svg.setPointerCapture(event.pointerId)
  state.dragging = true
  moveQuery(event)
})
elements.svg.addEventListener('pointermove', (event) => {
  if (state.panning) panGraph(event)
  else if (state.dragging) moveQuery(event)
})
elements.svg.addEventListener('pointerup', () => {
  state.dragging = false
  state.panning = false
  state.panStart = null
  elements.svg.classList.remove('is-panning')
})
elements.svg.addEventListener('pointercancel', () => {
  state.dragging = false
  state.panning = false
  state.panStart = null
  elements.svg.classList.remove('is-panning')
})
elements.svg.addEventListener('contextmenu', (event) => {
  if (state.zoom > 1) event.preventDefault()
})
elements.svg.addEventListener('keydown', (event) => {
  const delta = (event.shiftKey ? .05 : .015) / state.zoom
  const view = getViewBounds()
  const movement = { ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowDown: [0, -delta], ArrowUp: [0, delta] }
  if (movement[event.key]) {
    event.preventDefault()
    state.query = {
      x: clamp(state.query.x + movement[event.key][0], view.minX, view.maxX),
      y: clamp(state.query.y + movement[event.key][1], view.minY, view.maxY),
    }
    stopPlayback()
    render()
  } else if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    state.k = Math.min(15, state.k + 1)
    stopPlayback()
    render()
  } else if (event.key === '-') {
    event.preventDefault()
    state.k = Math.max(1, state.k - 1)
    stopPlayback()
    render()
  }
})

elements.dataset.addEventListener('change', () => {
  changeDataset(elements.dataset.value)
})
elements.reset.addEventListener('click', () => {
  state.query = { ...INITIAL_QUERY }
  state.zoom = 1
  state.zoomCenter = { x: .5, y: .5 }
  state.k = 5
  state.metric = 'euclidean'
  state.regions = false
  stopPlayback()
  render()
})
elements.play.addEventListener('click', startPlayback)
elements.zoomIn.addEventListener('click', () => zoomTo(state.zoom * 1.5))
elements.zoomOut.addEventListener('click', () => zoomTo(state.zoom / 1.5))
elements.zoomReset.addEventListener('click', () => zoomTo(1))
elements.kRange.addEventListener('input', () => {
  state.k = Number(elements.kRange.value)
  stopPlayback()
  render()
})
elements.ticks.addEventListener('click', (event) => {
  const button = event.target.closest('[data-k]')
  if (!button) return
  state.k = Number(button.dataset.k)
  stopPlayback()
  render()
})
document.querySelectorAll('[data-metric]').forEach((button) => {
  button.addEventListener('click', () => {
    state.metric = button.dataset.metric
    stopPlayback()
    render()
  })
})
elements.speedRange.addEventListener('input', () => {
  state.speed = Number(elements.speedRange.value)
  render()
  if (state.playing) scheduleNextStep()
})
elements.regions.addEventListener('click', () => {
  state.regions = !state.regions
  render()
})

  render()
})()
