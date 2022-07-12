'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var invariant = require('tiny-invariant');
var DB = require('aws-sdk/clients/dynamodb');
var https = require('https');

function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

var invariant__default = /*#__PURE__*/_interopDefault(invariant);
var DB__default = /*#__PURE__*/_interopDefault(DB);
var https__default = /*#__PURE__*/_interopDefault(https);

const rollParseRegex = /(\d+)?[dD](\d+)([\+\-]\d+)?/;
function parseRoll(roll) {
  console.debug("parsing the roll", roll);
  let parsed = rollParseRegex.exec(roll);

  if (parsed != null) {
    let [, rollNb = 1, sides, modifier] = parsed;
    let rolled = 0;
    let rolls = [];

    while (rolled < rollNb) {
      rolls.push(getRandom(parseInt(sides)));
      rolled++;
    }

    let totalBeforeModifiers = rolls.reduce((a, b) => a + b, 0);
    let total = modifier ? totalBeforeModifiers + parseInt(modifier) : totalBeforeModifiers;
    let result = {
      rolls,
      rollNb,
      sides,
      modifier,
      totalBeforeModifiers,
      total
    };
    console.debug("parsed", result);
    return result;
  } else {
    console.error("roll is not valid");
    return null;
  }
}
function fuzzySearchRegexTemplate(word) {
  return `(?=[a-z\u00E0-\u00FC]*${word}[a-z\u00E0-\u00FC]*)`;
}

function getRandom(max) {
  return Math.floor(Math.random() * max + 1);
}

var chaosEffects = [
	"Lancez le dé dans ce tableau au début de chacun de vos tours pendant la minute qui vient. Si vous obtenez de nouveau ce résultat pendant cette période, ignorez-le",
	"Pendant la minute qui vient, vous voyez les créatures invisibles tant qu'elles se trouvent dans votre champ de vision",
	"Un modron choisi et contrôlé par le MD apparaît dans un emplacement inoccupé situé dans unrayon de 1,50 mètres autour de vous et disparaît au bout d'une minute",
	"Vous lancez une \"boule de feu\" comme un sort de niveau 3 centré sur votre personne",
	"Vous lancez un projectile magique comme un sort de niveau 5",
	"Lancez 1d10. Votre taille varie d'un nombre de centimètres égal au résultat de ce jet multiplié par 2,5: si le résultat du dé est pair, vous rétrécissez, sil est impair, vous grandissez",
	"Vous lancez un sort de \"confusion\" centré sur vous-même",
	"Pendantla minute qui vient, vous récupérez 5 points de vie au début de chacun de vos tours",
	"Une longue barbe faite de plumes vous pousse soudain au menton et reste là jusqu'à ce que vous éternuiez. Les plumes s'envolent alors et libèrent votre visage",
	"Vous lancez un sort de \"graisse\" centré sur vous-même",
	"Les créatures sont désavantagées lors de leur jet de sauvegarde contre le prochain sort que vous lancez dans la minute qui vient et qui nécessite un jet de sauvegarde",
	"Votre peau prend une vive couleur bleue. Il faut recourir au sort \"lever une malédiction\" pour dissiper cet effet",
	"Un oeil apparaît au beau milieu de votre front et y demeure pendant la minute qui vient. Pendant ce temps, vous êtes avantagé sur les tests de Sagesse (Perception) basés sur la vue",
	"Pendant la minute qui vient, tous vos sorts dotés d'une durée d'incantation d'une action voient cette durée réduite à une action bonus",
	"Vous vous téléportez d'un maximum de 18 mètres, jusqu'à un emplacement inoccupé de votre choix situé dans votre champ de vision",
	"Vous êtes emporté sur le plan astral jusqu'à la fin de votre prochain tour, après quoi, vous retournez à l'emplacement que vous occupiez précédemment ou dans l'emplacement libre le plus proche si le précédent est occupé",
	"Le premier sort offensif que vous lancez dans la minute qui vient inflige des dégâts maximaux",
	"Lancez un d10. Votre âge se modifie d'un nombre d'années égal au résultat obtenu. Si le résultat est pair, vous rajeunissez (mais vous ne pouvez pas avoir moins d'un an), s'il est impair, vous vieillissez",
	"1d6 flumphs contrôlés par le MD apparaissent dans un emplacement inoccupé situé dans un rayon de 18 mètres autour de vous. Ils sont terrorisés à votre vue et disparaissent au bout d'une minute",
	"Vous récupérez 2d10 points de vie",
	"Vous vous changez en plante verte poussant dans un pot jusqu'au début de votre prochain tour. En tant que plante, vous êtes neutralisé et vulnérable à tous les types de degats. Si vous tombez à 0 point de vie, le pot se brise et vous reprenez votre forme normale",
	"Pendant la minute qui vient, vous pouvez vous téléporter d'au maximum 6 mètres par une action bonus à chacun de vos tours",
	"Vous lancez \"lévitation\" sur votre personne",
	"Une licorne contrôlée par le MD apparaît dans un emplacement situé dans un rayon de 1,50 mètre autour de vous et disparaît au bout d'une minute",
	"Vous êtes dans l'incapacité de parler pendant toute la minute qui vient. Quand vous essayez,des bulles roses sortent de votre bouche",
	"Un bouclier spectral flotte près de vous pendantla minute qui vient. Il vous accorde un bonus de +2 à la CA et l'immunité contre les \"projectiles magiques\"",
	"Vous êtes immunisé contre l'ébriété pendant les 5d6 jours à venir",
	"Vos cheveux tombent mais repoussent dans les 24 heures qui suivent",
	"Pendant la minute qui vient, tout objet inflammable que vous touchez qui n'est ni porté ni transporté par une autre créature s'enflamme soudain",
	"Vous récupérez l'emplacement de sort le plus bas que vous avez déjà dépensé",
	"Pendant la minute qui vient, vous êtes obligé de crier au lieu de parler",
	"Vous lancez le sort \"nappe de brouillard\" centrés sur votre personne",
	"Jusqu'à trois créatures de votre choix situées dans un rayon de 9 mètres autour de vous subissent 4d10 dégâts de foudre ",
	"Vous êtes terrorisé à la vue de la créature la plus proche de vous jusqu'à la fin de votre prochain tour",
	"Toutes les créatures situées dans un rayon de 9 mètres autour de vous deviennent invisibles pendantla minute qui vient. Si l'une d'elle attaque ou lance un sort, elle redevient visible",
	"Vous devenez résistant à tous les types de dégâts pendant la minute qui vient",
	"Une créature aléatoire située dans un rayon de 18 mètres autour de vous est empoisonnée pendant 1d4 heures",
	"Pendant la minute qui suit, vous brillez d'une vive lumière dans un rayon de 9 mètres. Toute créature qui termine son tour à 1,50 mètre ou moins de vous est aveuglée jusqu'à la fin de son prochain tour",
	"Vous lancez \"métamorphose\" sur vous-même. Si vous ratez votre jet de sauvegarde, vous vous changez en mouton pendant toute la durée du sort",
	"Pendant la minute qui vient, des papillons et des pétales de fleur illusoires flottent dans les airs dans un rayon de 3 mètres autour de vous",
	"Vous pouvez effectuer une action supplémentaire de suite",
	"Chaque créature située dans un rayon de 9 mètres autour de vous subit 1d10 dégâts nécrotiques. Vous récupérez un montant de points de vie égal à la somme des dégâts nécrotiques infligés",
	"Vous lancez \"image miroir\"",
	"Vous lancez \"vol\" sur une créature aléatoire située dans les 18 mètres",
	"Vous devenez invisible pendant la minute qui vient. Pendant cette période, les autres créatures ne vous entendent pas. Vous redevenez visible si vous attaquez ou lancez un sort",
	"Si vous mourez dans la minute qui vient, vous revenez immédiatement à la vie comme avec \"réincarnation\"",
	"Votre taille augmente d'une catégorie pendant la minute qui vient",
	"Vous et toutes les créatures situées dans un rayon de 9 mètres devenez vulnérables aux dégâts perforants pendant la minute qui vient",
	"Vous êtes entouré par une discrète musique éthérée pendant une minute",
	"Vous récupérez tous vos points de sorcellerie dépensés"
];

const chaosCommand = async () => {
  let {
    total: d100
  } = parseRoll("1d100-1") ?? {
    total: 0
  }; // A number between 0 and 50

  let d50 = Math.ceil(d100 / 2) - 1;
  let effect = chaosEffects[d50];
  let contextRollParsed = rollParseRegex.exec(effect);
  let responseParams = {};

  if (contextRollParsed) {
    let [rollToParse] = contextRollParsed;
    responseParams["reply_markup"] = {
      inline_keyboard: [[{
        text: `Lancer ${rollToParse}`,
        callback_data: `/r ${rollToParse}`
      }]]
    };
  }

  return {
    text: `Vous obtenez un ${d100}.\n\n${effect}.`,
    params: responseParams
  };
};

const rollCommand = async params => {
  let {
    rolls,
    modifier,
    totalBeforeModifiers,
    total
  } = parseRoll(params) ?? {};

  if (!rolls?.length) {
    return {
      text: `Désolé mais ce n'est pas un lancer de dés valide.\nIl faut un format du genre "2d8+4" par exemple.`
    };
  } else {
    let rollList = rolls.reduce((acc, r, i) => `${acc}\nJet n°${i + 1} : ${r}`, "");
    let totalString = `Total : ${totalBeforeModifiers}`;

    if (total != totalBeforeModifiers) {
      totalString = `Total : ${totalBeforeModifiers}${modifier ?? ""} = ${total}`;
    }

    return {
      text: `${params}\n${rollList}\n\n${totalString}`
    };
  }
};

function createButtonHorizontalList(buttons) {
  return createButtonGrid([buttons]);
}
function createButtonVerticalList(buttons) {
  return createButtonGrid(buttons.map(b => [b]));
}
function createButtonGrid(buttons) {
  const buttonsList = buttons.map((row, index) => {
    const buttonsRow = row.map((button, index) => ({
      text: button.label,
      callback_data: button.command
    }));
    return buttonsRow;
  });
  return {
    reply_markup: {
      inline_keyboard: buttonsList
    }
  };
}

var spells = [
	{
		name: "Absorption des éléments",
		originalName: "Absorb Elements",
		castedBy: [
			"artificer",
			"druid",
			"ranger",
			"sorcerer",
			"wizard"
		],
		id: "600c9159-b891-4388-ad9d-0216522bf1cf",
		level: 1,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 réaction, que vous prenez lorsque vous subissez des dégâts d'acide, de froid, de feu, de foudre ou de tonnerre",
		range: "personnelle",
		components: "S",
		duration: "1 round",
		description: "Le sort capte une partie de l'énergie entrante, ce qui réduit son effet sur vous et la stocke pour votre prochaine attaque au corps à corps. Vous obtenez une résistance à ce type de dégâts jusqu'au début de votre prochain tour. De plus, la première fois que vous touchez avec une attaque au corps à corps lors de votre prochain tour, la cible subit 1d6 dégâts supplémentaires du type d'élément ciblé, et le sort se termine.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts supplémentaires augmentent de 1d6 pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Agrandissement/Rapetissement",
		originalName: "Enlarge/Reduce",
		castedBy: [
			"artificer",
			"sorcerer",
			"wizard"
		],
		id: "b4b65d02-5482-4554-b6ee-eed25cdcc2c7",
		level: 2,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (une pincée de poudre de fer)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous agrandissez ou réduisez en taille une créature ou un objet que vous pouvez voir et qui est à portée pour la durée du sort. Choisissez une créature ou un objet qui n'est pas porté ou transporté. Si la cible n'est pas consentante, elle peut effectuer un jet de sauvegarde de Constitution. En cas de réussite, le sort n'a aucun effet.<br>Si la cible est une créature, toutes les choses qu'elle porte et transporte changent de taille avec elle. Tout objet lâché par la créature affectée reprend sa taille normale.<br><strong>Agrandissement</strong>. La cible double dans toutes les dimensions, et son poids est multiplié par huit. Cela augmente sa taille d'une catégorie, de M à G par exemple. S'il n'y a pas assez de place dans la pièce pour que la cible double de taille, la créature ou l'objet atteint la taille maximale possible dans l'espace disponible. Jusqu'à la fin du sort, la cible a aussi un avantage à ses jets de Force et ses jets de sauvegarde de Force. Les armes de la cible grandissent également. Tant que ces armes sont agrandies, les attaques de la cible occasionnent 1d4 dégâts supplémentaires.<br><strong>Rapetissement</strong>. La taille de la cible est diminuée de moitié dans toutes les dimensions, et son poids est divisé par huit. Cette réduction diminue sa taille d'une catégorie, de M à P par exemple. Jusqu'à la fin du sort, la cible a un désavantage à ses jets de Force et à ses jets de sauvegarde de Force. Les armes de la cible rapetissent aussi. Tant que ces armes sont réduites, les attaques de la cible occasionnent 1d4 dégâts en moins (minimum 1 point de dégâts).<br>"
	},
	{
		name: "Aide",
		originalName: "Aid",
		castedBy: [
			"artificer",
			"cleric",
			"paladin"
		],
		id: "48100801-c572-437d-8a2b-def36611bcda",
		level: 2,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (un petit bout de vêtement blanc)",
		duration: "8 heures",
		description: "Votre sort emplit vos alliés de robustesse et de résolution. Choisissez jusqu'à trois créatures à portée. Le maximum de points de vie et les points de vie actuels de chaque cible augmentent de 5 pour la durée du sort.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, les points de vie de chaque cible augmentent de 5 pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Alarme",
		originalName: "Alarm",
		castedBy: [
			"artificer",
			"ranger",
			"wizard"
		],
		id: "563145f6-d740-42e2-a9c4-b4a80bf4b0f5",
		level: 1,
		school: "abjuration",
		isRitual: true,
		castingTime: "1 minute",
		range: "9 mètres",
		components: "V, S, M (une petite clochette et un morceau de fil d'argent fin)",
		duration: "8 heures",
		description: "Vous mettez en place une alarme contre les intrusions indésirables. Choisissez une porte, une fenêtre, ou une zone à portée qui ne dépasse pas un cube de 6 mètres d'arête. Jusqu'à la fin du sort, une alarme vous alerte lorsqu'une créature taille TP ou supérieure touche ou pénètre la zone surveillée. Lorsque vous lancez ce sort, vous pouvez désigner des créatures qui ne déclencheront pas l'alarme. Vous pouvez également choisir si l'alarme est audible ou juste mentale.<br>Une alarme mentale vous alerte avec une sonnerie dans votre esprit à condition que vous soyez à 1,5 kilomètre maximum de la zone surveillée. Cette sonnerie vous réveille si vous êtes endormi. Une alarme audible produit le son d'une clochette à main, pendant 10 secondes, pouvant être entendue à 18 mètres.<br>"
	},
	{
		name: "Amélioration de caractéristique",
		originalName: "Enhance Ability",
		castedBy: [
			"artificer",
			"bard",
			"cleric",
			"druid",
			"sorcerer"
		],
		id: "cc2d941e-f93d-4182-b984-6a3854e9bca0",
		level: 2,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (le poil ou la plume d'une bête)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous touchez une créature et lui accordez une amélioration magique. Choisissez l'un des effets suivants ; la cible gagne cet effet jusqu'à ce que le sort prenne fin.<br><strong>Endurance de l'ours</strong>. La cible a un avantage à ses jets de Constitution. Elle gagne également 2d6 points de vie temporaires, qui sont perdus lorsque le sort prend fin.<br><strong>Force du taureau</strong>. La cible a un avantage à ses jets de Force, et sa capacité de charge double.<br><strong>Grâce féline</strong>. La cible a un avantage à ses jets de Dextérité. De plus, elle ne subit aucun dégât lorsqu'elle chute de 6 mètres ou moins et qu'elle n'est pas incapable d'agir.<br><strong>Splendeur de l'aigle</strong>. La cible a un avantage à ses jets de Charisme.<br><strong>Ruse du Renard</strong>. La cible a un avantage à ses jets d'Intelligence.<br><strong>Sagesse du Hibou</strong>. La cible a un avantage à ses jets de Sagesse.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Amélioration de compétences",
		originalName: "Skill Empowerment",
		castedBy: [
			"artificer",
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "8ec5c4ab-32f3-4613-ac67-7c530f02618d",
		level: 5,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "La cible double son bonus de maîtrise pour une compétence."
	},
	{
		name: "Animation d'objets",
		originalName: "Animate Objects Animation des objets",
		castedBy: [
			"artificer",
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "e98e0476-4b5d-4014-8151-4836f9a3460c",
		level: 5,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Les objets prennent vie à votre demande. Choisissez jusqu'à dix objets non magiques dans la portée du sort qui ne sont pas portés ou transportés. Les cibles de taille M compte pour deux objets, ceux de taille G comptent pour quatre et les objets de taille TG comptent pour huit. Vous ne pouvez pas animer un objet plus grand que la taille TG. Chaque cible anime et devient une créature sous votre contrôle jusqu'à la fin du sort ou jusqu'à ce qu'elle soit réduite à 0 point de vie.<br>Par une action bonus, vous pouvez commander mentalement les créatures que vous avez animées avec ce sort si elles sont à 150 mètres ou moins de vous. Si vous contrôlez plusieurs créatures, vous commandez simultanément autant de créatures que vous le souhaitez en donnant le même ordre à chacune d'elles. Vous décidez de l'action que prend la créature et du mouvement qu'elle fait. Vous pouvez aussi émettre une consigne générale, comme monter la garde devant une pièce ou dans un couloir. Si vous ne donnez aucun ordre, la créature ne fait que se défendre contre les créatures qui lui sont hostiles. Une fois qu'un ordre est donné, la créature s'exécute jusqu'à ce que la tâche soit complétée.<br><table><tbody><tr><th>Taille</th><th>PV</th><th>CA</th><th>Attaque</th><th>For</th><th>Dex</th></tr><tr><td>TP</td><td>20</td><td>18</td><td>+8 au toucher, dégâts 1d4 + 4</td><td>4</td><td>18</td></tr><tr><td>P</td><td>25</td><td>16</td><td>+6 au toucher, dégâts 1d8 + 2</td><td>6</td><td>14</td></tr><tr><td>M</td><td>40</td><td>13</td><td>+5 au toucher, dégâts 2d6 + 1</td><td>10</td><td>12</td></tr><tr><td>G</td><td>50</td><td>10</td><td>+6 au toucher, dégâts 2d10 + 2</td><td>14</td><td>10</td></tr><tr><td>TG</td><td>80</td><td>10</td><td>+8 au toucher, dégâts 2d12 + 4</td><td>18</td><td>6</td></tr></tbody></table><br>Un objet animé est un artificiel avec une CA, des points de vie, des attaques, une Force et une Dextérité déterminés par sa taille. Il possède 10 en Constitution, 3 en Intelligence et en Sagesse, et 1 en Charisme. Sa vitesse est de 9 mètres, ou bien si l'objet est dépourvu de jambes ou d'autres appendices équivalents pouvant servir à son déplacement il possède alors une vitesse de vol de 9 mètres qui lui permet aussi de faire du sur-place. Si l'objet est solidement attaché à une surface ou à un objet plus gros, telle une chaîne ancrée dans un mur, sa vitesse est de 0. L'objet est doté de la vision aveugle sur un rayon de 9 mètres et il est aveuglé au-delà de cette distance. Lorsque l'objet animé est réduit à 0 point de vie, il reprend sa forme originale et l'excédent de dégâts est infligé à l'objet inanimé.<br>Si vous ordonnez à un objet d'attaquer, il peut faire une simple attaque au corps à corps contre une créature à 1,50 mètre ou moins de celui-ci. Il fait une attaque de coup avec un bonus d'attaque et des dégâts contondants déterminés par sa taille. Le MD peut décréter qu'un objet spécifique peut infliger des dégâts tranchants ou perforants, selon la forme dudit objet.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 6 ou supérieur, vous pouvez animer deux objets supplémentaires pour chaque niveau d'emplacement au-delà du niveau 5.<br>"
	},
	{
		name: "Arme élémentaire",
		originalName: "Elemental Weapon",
		castedBy: [
			"artificer",
			"paladin"
		],
		id: "c34ba9ae-872c-402c-af3f-2722f0d27414",
		level: 3,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Une arme non magique que vous touchez devient une arme magique. Choisissez l'un des types de dégâts suivants : acide, froid, feu, foudre ou tonnerre. Pour la durée du sort, l'arme obtient un bonus de +1 aux jets d'attaque et inflige 1d4 dégâts supplémentaires, du type que vous avez choisi, lorsqu'elle touche.",
		higherLevel: "Si vous lancez ce sort en utilisant un emplacement de sort de niveau 5 ou 6, le bonus aux jets d'attaque monte à +2 et les dégâts supplémentaires montent à 2d4. Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 7 ou supérieur, le bonus monte à +3 et les dégâts supplémentaires à 3d4.<br>"
	},
	{
		name: "Arme magique",
		originalName: "Magic Weapon",
		castedBy: [
			"artificer",
			"paladin",
			"wizard"
		],
		id: "7b5fc5d0-53d6-4d35-8f2f-ada92943d748",
		level: 2,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "contact",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous touchez une arme non magique. Jusqu'à la fin du sort, l'arme est considérée comme étant une arme magique avec un bonus de +1 aux jets d'attaque et aux dégâts.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, le bonus augmente à +2. Lorsque vous utilisez un emplacement de sort de niveau 6 ou supérieur, le bonus augmente à +3.<br>"
	},
	{
		name: "Aspersion d'acide",
		originalName: "Acid Splash Aspersion acide",
		castedBy: [
			"artificer",
			"sorcerer",
			"wizard"
		],
		id: "2620fe0e-eeab-4e64-abdb-6f1249d06433",
		level: 0,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous propulsez une bulle d'acide. Choisissez une ou deux créatures que vous pouvez voir, à 1,50 mètre ou moins l'une de l'autre, dans la portée du sort. La cible doit réussir un jet de sauvegarde de Dextérité ou subir 1d6 dégâts d'acide.<br>Les dégâts de ce sort augmentent de 1d6 lorsque vous atteignez le niveau 5 (2d6), le niveau 11 (3d6) et le niveau 17 (4d6).<br>"
	},
	{
		name: "Assistance",
		originalName: "Guidance",
		castedBy: [
			"artificer",
			"cleric",
			"druid"
		],
		id: "03ac34b6-761e-479e-b4bc-40ec8b06af51",
		level: 0,
		school: "divination",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous touchez une créature consentante. Une fois avant la fin du sort, la cible peut lancer un d4 et ajouter le résultat du dé à un jet de caractéristique de son choix. Elle peut lancer le dé avant ou après avoir effectué son jet de caractéristique. Le sort prend alors fin.<br>"
	},
	{
		name: "Bouche magique",
		originalName: "Magic Mouth",
		castedBy: [
			"artificer",
			"bard",
			"wizard"
		],
		id: "4c6becb1-2264-4941-a44a-cebd4aad43b3",
		level: 2,
		school: "illusion",
		isRitual: true,
		castingTime: "1 minute",
		range: "9 mètres",
		components: "V, S, M (un rayon de miel et de la poussière de jade valant au moins 10 po, que le sort consomme)",
		duration: "jusqu'à dissipation",
		description: "Vous implantez un message dans un objet dans la portée du sort. Le message est verbalisé lorsque les conditions de déclenchement sont remplies. Choisissez un objet que vous voyez et qui n'est pas porté ou transporté par une autre créature. Ensuite, prononcez le message, qui ne doit pas dépasser 25 mots mais dont l'écoute peut prendre jusqu'à 10 minutes. Finalement, établissez les circonstances qui déclencheront le sort pour livrer votre message.<br>Lorsque ces circonstances sont réunies, une bouche magique apparaît sur l'objet et elle articule le message en imitant votre voix, sur le même ton employé lors de l'implantation du message. Si l'objet choisi possède une bouche ou quelque chose qui s'en approche, comme la bouche d'une statue, la bouche magique s'animera à cet endroit, donnant l'illusion que les mots proviennent de la bouche de l'objet.<br>Lorsque vous lancez ce sort, vous pouvez décider que le sort prend fin une fois que le message est livré ou qu'il peut persister et répéter son message à chaque fois que les circonstances se produisent.<br>Les conditions de déclenchement peuvent être aussi génériques ou aussi précises que vous le souhaitez. Cependant, elles doivent être basées sur des critères visuels ou audibles perceptibles à 9 mètres ou moins de l'objet. Par exemple, vous pouvez commander à la bouche de parler lorsqu'une créature quelconque s'approche à 9 mètres ou moins de l'objet, ou lorsqu'on sonne une clochette d'argent à 9 mètres ou moins.<br>"
	},
	{
		name: "Brassage caustique de Tasha",
		originalName: "Tasha's Caustic Brew",
		castedBy: [
			"artificer",
			"sorcerer",
			"wizard"
		],
		id: "ec2723d1-a239-44ba-be68-142bfddb8e4f",
		level: 1,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (ligne de 9 mètres)",
		components: "V, S, M (un peu de nourriture pourrie)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Les créatures sur une ligne de 9 x 1,50 m doivent réussir un JdS de Dex. ou subir 2d4 dégâts d'acide chaque tour (+2d4/niv)."
	},
	{
		name: "Catapulte",
		originalName: "Catapult",
		castedBy: [
			"artificer",
			"sorcerer",
			"wizard"
		],
		id: "db8eb64f-b8f2-45c4-b899-9a3c3cf2b4c1",
		level: 1,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "S",
		duration: "instantanée",
		description: "Choisissez un objet pesant de 500 g à 2,5 kg à portée et qui n'est ni porté ni transporté. L'objet vole en ligne droite jusqu'à 27 mètres dans une direction que vous choisissez avant de tomber au sol, s'arrêtant plus tôt s'il rencontre une surface solide. Si l'objet va frapper une créature, cette créature doit faire un jet de sauvegarde de Dextérité. En cas d'échec à la sauvegarde, l'objet frappe la cible et arrête sa course. Lorsque l'objet heurte quelque chose, l'objet et ce qu'il frappe subissent chacun 3d8 dégâts contondants.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, le poids maximal de l'objet que vous pouvez cibler avec ce sort augmente de 2,5 kg et les dégâts augmentent de 1d8 pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Chien de garde de Mordenkainen",
		originalName: "Mordenkainen's Faithful Hound",
		castedBy: [
			"artificer",
			"wizard"
		],
		id: "abc587fb-1f11-4993-b913-b03407a0c171",
		level: 4,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (un minuscule sifflet d'argent, un morceau d'os, et un bout de ficelle)",
		duration: "8 heures",
		description: "Vous invoquez un chien de garde fantomatique dans un espace inoccupé que vous pouvez voir et à portée, où il reste pour la durée du sort, jusqu'à ce que vous le renvoyiez par une action, ou jusqu'à ce que vous vous déplaciez à plus de 30 mètres de lui.<br>Le chien est invisible pour toutes les créatures, vous excepté, et on ne peut pas lui faire du mal. Lorsqu'une créature de taille P ou supérieure s'approche à 9 mètres ou moins de lui sans donner le mot de passe que vous avez spécifié lorsque vous avez lancé le sort, le chien commence à aboyer bruyamment. Le chien voit les créatures invisibles et peut également voir le plan éthéré. Il ignore les illusions.<br>Au début de chacun de vos tours, le chien tente de mordre une créature se trouvant à 1,50 mètre ou moins de lui et qui vous est hostile. Le bonus à l'attaque du chien de garde est égal au modificateur de votre caractéristique d'incantation + votre bonus de maîtrise. Si le coup touche, il inflige 4d8 dégâts perforants.<br>"
	},
	{
		name: "Clignotement",
		originalName: "Blink",
		castedBy: [
			"artificer",
			"sorcerer",
			"wizard"
		],
		id: "28b8a3ab-97fa-4e2b-842f-c158bfa93c21",
		level: 3,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "1 minute",
		description: "Lancez un d20 à la fin de chacun de vos tours pour toute la durée du sort. Si le résultat du jet est 11 ou plus, vous disparaissez du plan d'existence actuel et apparaissez dans le plan éthéré (le sort échoue mais l'emplacement de sort est dépensé si vous vous trouvez déjà dans le plan éthéré). Au début de votre prochain tour, ou lorsque le sort prend fin si vous êtes dans le plan éthéré, vous retournez dans un espace inoccupé de votre choix que vous pouvez voir et situé à 3 mètres maximum de l'endroit où vous avez disparu. S'il n'y a aucun espace inoccupé de disponible à portée, vous apparaissez dans l'espace inoccupé le plus proche (choisi aléatoirement si plus d'un espace inoccupé remplissant les conditions est disponible). Vous pouvez annuler ce sort par une action.<br>Lorsque vous êtes dans le plan éthéré, vous pouvez voir et entendre le plan dont vous êtes originaire, qui apparaît en nuances de gris, mais vous ne pouvez voir à plus de 18 mètres. Vous ne pouvez affecter et être affecté que par d'autres créatures du plan éthéré. Les créatures qui n'y sont pas ne peuvent ni vous percevoir ni interagir avec vous, à moins qu'une capacité le leur permette.<br>"
	},
	{
		name: "Coffre secret de Léomund",
		originalName: "Leomund's Secret Chest",
		castedBy: [
			"artificer",
			"wizard"
		],
		id: "cd2adf6c-7610-491c-8b37-03847b49e030",
		level: 4,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (un coffre raffiné, dimensions ",
		duration: "instantanée",
		description: "Vous cachez un coffre, et tout son contenu, dans le plan éthéré. Vous devez toucher le coffre et sa réplique miniature qui vous sert de composante matérielle pour le sort. Le coffre peut contenir jusqu'à un tiers de mètre cube de matériel non-vivant (90 cm x 60 cm x 60 cm).<br>Tant que le coffre reste dans le plan éthéré, vous pouvez utiliser une action et toucher la réplique pour rappeler le coffre. Il apparaît sur le sol, dans un espace inoccupé, dans un rayon de 1,50 mètre de vous. Vous pouvez renvoyer le coffre dans le plan éthéré en utilisant une action et en touchant à la fois le coffre et sa réplique.<br>Passé un délai de 60 jours, il y a 5 % de risque par jour (les risques se cumulent de jour en jour) que l'effet du sort prenne fin. L'effet du sort prend fin si vous lancez de nouveau ce sort, si la réplique miniature du coffre est détruite, ou si vous choisissez de mettre un terme au sort par une action. Si le sort prend fin et que la version large du coffre se trouve toujours dans le plan éthéré, il est irrémédiablement perdu.<br>"
	},
	{
		name: "Collet",
		originalName: "Snare",
		castedBy: [
			"artificer",
			"druid",
			"ranger",
			"wizard"
		],
		id: "f339a380-7024-41c5-a8a7-c03a430bc6b2",
		level: 1,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 minute",
		range: "contact",
		components: "S, M (7,50 m de corde, que le sort consomme)",
		duration: "8 heures",
		description: "Lorsque vous lancez ce sort, vous utilisez la corde pour créer un cercle de 1,50 mètre de rayon au sol. Une fois le sort lancé, la corde disparaît et le cercle devient un piège magique.<br>Le piège est presque invisible et demande un jet d'Intelligence (Investigation) réussi contre le DD de sauvegarde de votre sort pour être décelé.<br>Le piège se déclenche lorsqu'une créature de taille P, M ou G marche sur le sol dans le rayon du sort. Cette créature doit réussir un jet de sauvegarde de Dextérité ou bien être magiquement hissée dans les airs, pour se retrouver pendue la tête à l'envers à 90 cm au-dessus du sol. La créature est entravée jusqu'à ce que le sort se termine.<br>Une créature entravée peut effectuer un jet de sauvegarde de Dextérité à la fin de chacun de ses tours, mettant fin à l'effet sur elle-même en cas de réussite. La créature ou quelqu'un d'autre qui peut l'atteindre peut aussi utiliser son action pour effectuer un jet d'Intelligence (Arcanes) contre le DD de sauvegarde de votre sort. En cas de réussite, l'effet d'entrave prend fin.<br>Après le déclenchement du piège, le sort se termine lorsque le piège ne retient plus aucune créature.<br>"
	},
	{
		name: "Convocation d'artificiel",
		originalName: "Summon Construct",
		castedBy: [
			"artificer",
			"wizard"
		],
		id: "9f7c2332-9bc2-4630-abd4-6f27d97e201f",
		level: 4,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (une pierre ornée et un coffre en métal d'une valeur d'au moins 400 po)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Invoque 1 esprit de créature artificielle (argile, métal ou pierre) amical (bloc stat/votre niv)."
	},
	{
		name: "Corde enchantée",
		originalName: "Rope Trick",
		castedBy: [
			"artificer",
			"wizard"
		],
		id: "be34af90-831c-4975-92c5-45b97c47181b",
		level: 2,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (de l'extrait de poudre de maïs et un bout de parchemin torsadé)",
		duration: "1 heure",
		description: "Vous touchez une longueur de corde de 18 mètres maximum. Une extrémité de la corde se dresse alors et monte dans les airs de sorte que toute la longueur de la corde soit verticale par rapport au sol. À l'extrémité supérieure de la corde, une entrée invisible vers un espace extradimensionnel s'ouvre et reste en place pour toute la durée du sort.<br>L'espace extradimensionnel peut être atteint en grimpant tout en haut de la corde. L'espace peut contenir jusqu'à huit créatures de taille M ou inférieure. La corde peut être tirée dans l'espace extradimensionnel, elle disparaît alors de la vue de ceux qui se trouvent à l'extérieur de l'espace extradimensionnel.<br>Les attaques et les sorts ne peuvent pas traverser l'entrée de l'espace extradimensionnel, qu'ils viennent de l'intérieur ou de l'extérieur, mais ceux qui se trouvent dans l'espace extradimensionnel peuvent voir à l'extérieur comme s'il y avait une fenêtre de 90 cm x 1,50 m centrée sur la corde.<br>Tout ce qui se trouve dans l'espace extradimensionnel en tombe lorsque le sort prend fin.<br>"
	},
	{
		name: "Coup de tonnerre",
		originalName: "Thunderclap",
		castedBy: [
			"artificer",
			"bard",
			"druid",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "069d1f48-bc6b-4193-bb08-30eb9c44cab2",
		level: 0,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "1,50 mètre",
		components: "S",
		duration: "instantanée",
		description: "Vous créez un bruit de tonnerre qui peut être entendu jusqu'à 30 mètres. Hormis vous-même, toute créature à portée doit réussir un jet de sauvegarde de Constitution ou subir 1d6 dégâts de tonnerre.<br>Les dégâts de ce sort augmentent de 1d6 lorsque vous atteignez le niveau 5 (2d6), le niveau 11 (3d6) et le niveau 17 (4d6).<br>"
	},
	{
		name: "Création",
		originalName: "Creation",
		castedBy: [
			"artificer",
			"sorcerer",
			"wizard"
		],
		id: "df259e06-2e47-4834-a738-4ccf510484a5",
		level: 5,
		school: "illusion",
		isRitual: false,
		castingTime: "1 minute",
		range: "9 mètres",
		components: "V, S, M (un petit bout de matériau du même type que celui composant l'objet que vous souhaitez créer)",
		duration: "spéciale",
		description: "Vous extirpez de la Gisombre des brumes ténébreuses qui vous serviront de matériau pour créer, à portée, un objet non vivant en matière végétale : du tissu, de la corde, du bois, ou quelque chose de similaire. Vous pouvez également utiliser ce sort pour créer un objet minéral comme de la pierre, du cristal ou du métal. L'objet créé ne doit pas dépasser un cube de 1,50 mètre d'arête, et vous devez déjà avoir vu la forme et les matériaux que vous souhaitez donner à l'objet.<br>La durée d'effet du sort dépend du matériau de l'objet. Si l'objet comporte plusieurs matériaux, utilisez la durée la plus courte.<br><table><tbody><tr><th>Matériau</th><th>Durée</th></tr><tr><td>Matière végétale</td><td>1 jour</td></tr><tr><td>Pierre ou cristal</td><td>12 heures</td></tr><tr><td>Métaux précieux</td><td>1 heure</td></tr><tr><td>Gemmes</td><td>10 minutes</td></tr><tr><td>Adamantium ou mithral</td><td>1 minute</td></tr></tbody></table><br>Utiliser un matériau créé à l'aide du sort <em>création</em> en tant que composante matérielle d'un autre sort fait automatiquement échouer cet autre sort.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 6 ou supérieur, les arêtes du cube augmentent de 1,50 mètre pour chaque niveau d'emplacement au-delà du niveau 5.<br>"
	},
	{
		name: "Création de nourriture et d'eau",
		originalName: "Create Food and Water",
		castedBy: [
			"artificer",
			"cleric",
			"paladin"
		],
		id: "299f59cf-2f99-4dd6-8387-65944b7157a6",
		level: 3,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous créez 22,5 kg de nourriture et 120 litres d'eau sur le sol ou dans des contenants, à portée, ce qui est assez pour subvenir aux besoins de quinze humanoïdes ou de cinq montures pour 24 heures. La nourriture est fade mais nourrissante, et se gâte si elle n'est pas mangée au-delà de 24 heures. L'eau est claire et ne croupit pas.<br>"
	},
	{
		name: "Déguisement",
		originalName: "Disguise Self",
		castedBy: [
			"artificer",
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "bd31619f-908c-498c-8559-309ce84b7d6b",
		level: 1,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "1 heure",
		description: "Vous changez d'apparence jusqu'à ce que le sort prenne fin ou que vous utilisiez une action pour le dissiper. Le changement inclut vos vêtements, votre armure, vos armes et les autres objets que vous portez. Vous pouvez paraître 30 cm plus grand ou plus petit, mince, obèse, ou entre les deux. Vous ne pouvez pas modifier votre type morphologique. Vous devez donc prendre une forme qui présente un arrangement similaire des membres. Par ailleurs, l'ampleur de l'illusion ne tient qu'à vous.<br>Les modifications apportées par ce sort ne résistent pas à une inspection physique. Par exemple, si vous utilisez ce sort pour ajouter un chapeau à votre accoutrement, les objets passeront à travers le chapeau et si on y touche, on ne sentira pas sa présence ou on tâtera plutôt votre tête et votre chevelure. Si vous utilisez ce sort pour paraître plus mince, la main d'une personne qui veut vous toucher entrera en contact avec votre corps alors que sa main semble libre d'obstruction.<br>Pour détecter que vous êtes déguisé, une créature peut utiliser son action pour inspecter votre apparence et elle doit réussir un jet d'Intelligence (Investigation) contre le DD de sauvegarde de votre sort.<br>"
	},
	{
		name: "Détection de la magie",
		originalName: "Detect Magic",
		castedBy: [
			"artificer",
			"bard",
			"cleric",
			"druid",
			"paladin",
			"ranger",
			"sorcerer",
			"wizard"
		],
		id: "c62ab943-64af-43f4-8830-d39c432f5d76",
		level: 1,
		school: "divination",
		isRitual: true,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Pour la durée du sort, vous percevez la présence de magie à 9 mètres ou moins de vous. Si vous percevez de la magie de cette manière, vous pouvez utiliser votre action pour discerner une faible aura enveloppant une créature ou un objet visible dans la zone qui présente de la magie. Vous déterminez aussi l'école de magie, le cas échéant.<br>Le sort peut outrepasser la plupart des obstacles mais il est bloqué par 30 cm de pierre, 2,50 cm de métal ordinaire, une mince feuille de plomb ou 90 cm de bois ou de terre.<br>"
	},
	{
		name: "Dissipation de la magie",
		originalName: "Dispel Magic",
		castedBy: [
			"artificer",
			"bard",
			"cleric",
			"druid",
			"paladin",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "0b8ff5c8-95ff-406f-b831-377e11051478",
		level: 3,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Choisissez une créature, un objet ou un effet magique dans la portée du sort. Tous les sorts actifs de niveau 3 ou moins sur la cible prennent fin. Pour chaque sort actif de niveau 4 ou plus sur la cible, effectuez un jet de votre caractéristique d'incantation. Le DD est de 10 + le niveau du sort. Si le jet est réussi, le sort prend fin.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, les effets d'un sort actif sur la cible prennent automatiquement fin si le niveau du sort est égal ou inférieur au niveau de l'emplacement de sort utilisé.<br>"
	},
	{
		name: "Écrire dans le ciel",
		originalName: "Skywrite",
		castedBy: [
			"artificer",
			"bard",
			"druid",
			"wizard"
		],
		id: "e907a0d1-f9d3-4e23-b1c3-3917c5298d03",
		level: 2,
		school: "transmutation",
		isRitual: true,
		castingTime: "1 action",
		range: "champ de vision",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous faites apparaitre jusqu'à dix mots dans une partie du ciel que vous pouvez voir. Les mots semblent être faits de nuage et restent en place pour la durée du sort. Les mots se dissipent quand le sort se termine. Un vent fort peut disperser les nuages et mettre fin au sort prématurément.<br>"
	},
	{
		name: "Embrasement",
		originalName: "Create Bonfire",
		castedBy: [
			"artificer",
			"druid",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "6a4d1eca-0e40-42f5-ae67-666c49199d4f",
		level: 0,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous créez un feu de joie sur un sol visible dans la portée du sort. Jusqu'à ce que le sort finisse, le feu de joie magique occupe un cube de 1,50 mètre d'arête. Toute créature située à la place du feu de joie lorsque vous lancez le sort doit réussir un jet de sauvegarde de Dextérité ou subir 1d8 dégâts de feu. Une créature doit aussi faire un jet de sauvegarde lorsqu'elle se déplace dans l'espace occupé par le feu de joie pour la première fois dans un tour ou si elle termine son tour dans cet espace.<br>Le feu de joie met le feu aux objets inflammables dans sa zone qui ne sont ni tenus ni portés.<br>Les dégâts de ce sort augmentent de 1d8 lorsque vous atteignez le niveau 5 (2d8), le niveau 11 (3d8) et le niveau 17 (4d8).<br>"
	},
	{
		name: "Explosion de lames",
		originalName: "Sword Burst",
		castedBy: [
			"artificer",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "8ce2ef60-8111-41fd-b8a5-db0e22c8f4ba",
		level: 0,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (rayon de 1,50 mètre)",
		components: "V",
		duration: "instantanée",
		description: "Vous créez temporairement un cercle de lames spectrales autour de vous. Toutes les autres créatures dans un rayon de 1,50 mètre autour de vous doivent réussir un jet de sauvegarde de Dextérité ou subir 1d6 dégâts de force.<br>Les dégâts de ce sort augmentent de 1d6 lorsque vous atteignez les niveaux 5 (2d6), 11 (3d6) et 17 (4d6).<br>"
	},
	{
		name: "Fabrication",
		originalName: "Fabricate",
		castedBy: [
			"artificer",
			"wizard"
		],
		id: "d6c05992-53da-4a08-90ef-e96c2771ac64",
		level: 4,
		school: "transmutation",
		isRitual: false,
		castingTime: "10 minutes",
		range: "36 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous convertissez des matériaux bruts en objets confectionnés avec ces matières. Par exemple, vous pouvez fabriquer un pont en bois avec quelques arbres, une corde à partir d'une parcelle de chanvre, et des vêtements avec du lin ou de la laine.<br>Choisissez des matériaux bruts que vous pouvez voir et à portée. Vous pouvez fabriquer un objet de taille G ou inférieure (pouvant tenir dans un cube de 3 mètres d'arête, ou dans huit cubes de 1,50 mètre d'arête), à la condition que vous utilisiez suffisamment de matière première. Si vous utilisez ce sort en ciblant du métal, de la pierre, ou tout autre substance minérale, l'objet fabriqué est, au maximum, de taille M (pouvant tenir dans un cube de 1,50 mètre d'arête). La qualité des objets créés par ce sort correspond à la qualité des matières premières utilisées.<br>Les créatures et les objets magiques ne peuvent pas être créés ou transmutés grâce à ce sort. Vous ne pouvez pas non plus utiliser ce sort pour créer des objets qui nécessitent d'ordinaire un haut niveau d'artisanat, comme des bijoux, des armes, des lunettes, ou des armures, à moins que vous n'ayez la maîtrise du type d'outils d'artisans en rapport avec l'objet que vous comptez fabriquer.<br>"
	},
	{
		name: "Façonnage de la pierre",
		originalName: "Stone Shape",
		castedBy: [
			"artificer",
			"cleric",
			"druid",
			"wizard"
		],
		id: "d298a15c-90bd-4e65-a646-4d5849fa2358",
		level: 4,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (de l'argile molle, qui devra être travaillée grossièrement dans la forme souhaitée pour l'objet en pierre)",
		duration: "instantanée",
		description: "Vous touchez un objet en pierre de taille M ou P ou un bloc de pierre d'un maximum de 1,50 mètre d'arête et vous lui donnez n'importe quelle forme qui vous convient. Par exemple, vous pouvez transformer un gros rocher en arme, statue ou coffre, ou réaliser un petit passage à travers un mur, tant que le mur fait moins de 1,50 mètre d'épaisseur. Vous pouvez aussi façonner une porte de pierre et son encadrement pour pouvoir la fermer. L'objet que vous créez peut avoir un maximum de deux charnières et un verrou mais des détails mécaniques plus fins sont impossibles.<br>"
	},
	{
		name: "Feuille morte",
		originalName: "Feather Fall",
		castedBy: [
			"artificer",
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "0095bb89-32a9-4ceb-92d0-a2609ebf80dc",
		level: 1,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 réaction, que vous prenez lorsque vous ou une créature à 18 mètres ou moins de vous tombez.",
		range: "18 mètres",
		components: "V, M (une petite plume ou un peu de duvet)",
		duration: "1 minute",
		description: "Choisissez jusqu'à cinq créatures en chute libre dans la portée du sort. Le taux de descente d'une créature en chute libre est ramené à 18 mètres par round jusqu'à la fin du sort. Si la créature atterrit avant la fin du sort, elle ne subit aucun dégât de chute et elle retombe sur ses pieds. Le sort prend alors fin pour cette créature.<br>"
	},
	{
		name: "Flamme éternelle",
		originalName: "Continual Flame",
		castedBy: [
			"artificer",
			"cleric",
			"wizard"
		],
		id: "80989039-d2ca-4b7e-b176-a5912b4083e5",
		level: 2,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (de la poussière de rubis valant 50 po, que le sort consomme)",
		duration: "jusqu'à dissipation",
		description: "Une flamme, d'une luminosité équivalente à celle d'une torche, fait éruption depuis un objet que vous touchez. L'effet ressemble à une flamme régulière, mais il ne produit aucune chaleur et ne nécessite pas d'oxygène. Une flamme éternelle peut être recouverte ou dissimulée, mais elle ne peut pas être étouffée ou éteinte.<br>"
	},
	{
		name: "Fléau élémentaire",
		originalName: "Elemental Bane",
		castedBy: [
			"artificer",
			"druid",
			"warlock",
			"wizard"
		],
		id: "459d0804-372b-4eb5-bfe1-607e1c2e9e12",
		level: 4,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Choisissez une créature que vous pouvez voir dans la portée, et choisissez l'un des types de dégâts suivants : acide, froid, feu, foudre ou tonnerre. La cible doit réussir un jet de sauvegarde de Constitution ou être affectée par le sort pendant toute sa durée. La première fois à chaque tour que la cible affectée subit des dégâts du type choisi, la cible subit 2d6 dégâts supplémentaires de ce type. En outre, la cible perd toute résistance à ce type de dégâts jusqu'à ce que le sort se termine.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 5 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d'emplacement au-delà du niveau 4. Les créatures doivent être à 9 mètres les unes des autres lorsque vous les ciblez.<br>"
	},
	{
		name: "Flèches enflammées",
		originalName: "Flame Arrows",
		castedBy: [
			"artificer",
			"druid",
			"ranger",
			"sorcerer",
			"wizard"
		],
		id: "f5121bd2-396d-4822-aad6-eb93791b4ada",
		level: 3,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous touchez un carquois contenant des flèches ou des carreaux. Quand une cible est touchée par une attaque à distance avec une arme qui utilise une des munitions provenant du carquois, la cible reçoit 1d6 dégâts de feu supplémentaires. La magie du sort se termine pour une munition donnée lorsque celle-ci touche ou rate, et le sort cesse complètement lorsque douze munitions ont été tirées du carquois.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, le nombre de munitions qui peut affecter ce sort augmente de deux pour chaque emplacement supérieur au niveau 3.<br>"
	},
	{
		name: "Flou",
		originalName: "Blur",
		castedBy: [
			"artificer",
			"sorcerer",
			"wizard"
		],
		id: "56bbfa03-13e0-4ace-957a-290bee061202",
		level: 2,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "Votre corps devient flou, changeant et ondulant pour tous ceux qui peuvent vous voir. Tant que le sort dure, toutes les créatures ont un désavantage au jet d'attaque dirigé contre vous. Un attaquant est immunisé contre cet effet s'il n'utilise pas la vue, comme avec le combat aveugle, ou s'il peut voir à travers les illusions, comme avec une vision véritable.<br>"
	},
	{
		name: "Forteresse d'intellect",
		originalName: "Intellect Fortress",
		castedBy: [
			"artificer",
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "129e2378-bc82-405f-8b69-876eb6bf1757",
		level: 3,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V",
		duration: "concentration, jusqu'à 1 heure",
		description: "Pour la durée du sort, vous ou une créature consentante que vous pouvez voir à portée avez la résistance aux dégâts psychiques, ainsi qu'un avantage aux jets de sauvegarde d'Intelligence, de Sagesse et de Charisme.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de niveau 4 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d'emplacement supérieur au niveau 3. Les créatures doivent être à 9 mètres ou moins les unes des autres lorsque vous les ciblez.<br>"
	},
	{
		name: "Fouet épineux",
		originalName: "Thorn Whip",
		castedBy: [
			"artificer",
			"druid"
		],
		id: "3e8ba03f-83b8-45c1-b5ba-fc16b8884454",
		level: 0,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (la tige d'une plante avec des épines)",
		duration: "instantanée",
		description: "Vous créez une longue et épaisse liane ressemblant à de la vigne et recouverte d'épines qui, selon vos ordres, s'accroche à une créature à portée. Effectuez une attaque au corps à corps avec un sort contre la cible. Si l'attaque touche, la créature subit 1d6 dégâts perforants, et si la créature est de taille G ou inférieure, vous la tirez de 3 mètres vers vous.<br>Les dégâts de ce sort augmentent de 1d6 lorsque vous atteignez le niveau 5 (2d6), le niveau 11 (3d6) et le niveau 17 (4d6).<br>"
	},
	{
		name: "Fouet foudroyant",
		originalName: "Lightning Lure Fouet électrique",
		castedBy: [
			"artificer",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "da1b1a6a-b23f-4e4e-bc62-e3572343bf50",
		level: 0,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (rayon de 4,50 mètres)",
		components: "V",
		duration: "instantanée",
		description: "Vous créez une décharge d'énergie foudroyante qui frappe une créature de votre choix que vous pouvez voir dans un rayon de 4,50 mètres autour de vous. La cible doit réussir un jet de sauvegarde de Force ou être attirée vers vous en ligne droite sur 3 mètres puis subir 1d8 dégâts de foudre si elle se retrouve à 1,50 mètre ou moins de vous.<br>Les dégâts de ce sort augmentent de 1d8 lorsque vous atteignez les niveaux 5 (2d8), 11 (3d8) et 17 (4d8).<br>"
	},
	{
		name: "Gelure",
		originalName: "Frostbite",
		castedBy: [
			"artificer",
			"druid",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "9fc7764c-433e-45df-a60d-7fabb1c324ff",
		level: 0,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous faîtes se former une couche de gel engourdissante sur une créature que vous voyez à portée. La cible doit réussir un jet de sauvegarde de Constitution, sans quoi elle subit 1d6 dégâts de froid et obtient un désavantage à son prochain jet d'attaque avec une arme réalisé avant la fin de son prochain tour.<br>Les dégâts de ce sort augmentent de 1d6 lorsque vous atteignez le niveau 5 (2d6), le niveau 11 (3d6) et le niveau 17 (4d6).<br>"
	},
	{
		name: "Glyphe de protection",
		originalName: "Glyph of Warding Glyphe de garde",
		castedBy: [
			"artificer",
			"bard",
			"cleric",
			"wizard"
		],
		id: "a94f39bf-8c3a-4b97-a2f1-cc17baba58a8",
		level: 3,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 heure",
		range: "contact",
		components: "V, S, M (de l'encens et un diamant en poudre valant au moins 200 po, que le sort consomme)",
		duration: "jusqu'à dissipation ou déclenchement",
		description: "Lorsque vous lancez ce sort, vous inscrivez un glyphe qui peut blesser d'autres créatures, sur une surface (comme une table ou une portion de plancher ou de mur) ou à l'intérieur d'un objet qui peut être fermé (comme un livre, un parchemin ou un coffret) pour dissimuler le glyphe. Le glyphe peut couvrir un espace d'au plus 3 mètres de diamètre. Si la surface ou l'objet est déplacé de plus de 3 mètres d'où vous avez lancé ce sort, le glyphe est cassé et le sort se termine sans avoir été activé.<br>Le glyphe est pratiquement invisible et un jet d'Intelligence (Investigation) contre le DD de sauvegarde de votre sort est requis pour le découvrir.<br>Vous déterminez le déclencheur du glyphe lors de l'incantation du sort. Pour les glyphes inscrits sur une surface, les déclencheurs sont typiquement toucher ou se tenir sur un glyphe, retirer un objet posé sur le glyphe, s'approcher à une certaine distance du glyphe ou manipuler un objet sur lequel est inscrit le glyphe. Pour les glyphes inscrits dans un objet, les déclencheurs sont typiquement ouvrir l'objet, s'approcher à une certaine distance de l'objet, apercevoir ou lire le glyphe. Une fois que le glyphe est déclenché, le sort prend fin.<br>Vous pouvez raffiner les conditions de déclenchement de sorte que le sort s'active uniquement selon certaines circonstances ou selon des attributs physiques (hauteur ou poids), le type de créature (par exemple, seuls les aberrations ou les elfes noirs déclenchent le glyphe) ou l'alignement. Vous pouvez aussi déterminer les conditions pour que certaines créatures ne déclenchent pas le glyphe, en utilisant un mot de passe, par exemple.<br>Lorsque vous inscrivez le glyphe, faites un choix entre les <em>runes explosives</em> ou le <em>sort glyphique</em>.<br><strong>Runes explosives</strong>. Lors de son déclenchement, une énergie magique jaillit du glyphe dans une sphère de 6 mètres de rayon centrée sur le glyphe. La sphère contourne les coins. Chaque créature prise dans la zone doit effectuer un jet de sauvegarde de Dextérité, subissant 5d8 dégâts d'acide, de foudre, de feu, de froid ou de tonnerre (à déterminer lors de la création du glyphe) en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br><strong>Sort glyphique</strong>. Vous pouvez emmagasiner un sort préparé de niveau 3 ou moins dans le glyphe en l'incantant lors de la création du glyphe. Le sort doit cibler une seule créature ou une zone. Le sort emmagasiné n'a pas d'effet immédiat lorsqu'il est incanté de cette façon. Lorsque le glyphe est déclenché, le sort emmagasiné est incanté. Si le sort vise une cible, il visera la créature qui a déclenché le glyphe. Si le sort affecte une zone, la zone est centrée sur cette créature. Si le sort invoque des créatures hostiles ou s'il crée des objets blessants ou des pièges, ils apparaissent aussi près que possible de l'intrus et l'attaquent. Si le sort demande de la concentration, il persiste pour la durée complète du sort.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, les dégâts des runes explosives augmentent de 1d8 pour chaque niveau d'emplacement au-delà du niveau 3. Si vous créez un <em>sort glyphique</em>, vous pouvez emmagasiner un sort dont le niveau est équivalent ou moindre à l'emplacement de sort utilisé pour le <em>glyphe de protection</em>.<br>"
	},
	{
		name: "Graisse",
		originalName: "Grease",
		castedBy: [
			"artificer",
			"wizard"
		],
		id: "576df755-71d9-426e-98c8-df9bf3e048db",
		level: 1,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (une noix de beurre ou un peu de couenne de porc)",
		duration: "1 minute",
		description: "Une graisse visqueuse recouvre le sol sur un carré de 3 mètres de côté centré sur un point à portée, transformant cette zone en terrain difficile.<br>Lorsque la graisse apparaît, chaque créature se tenant debout dans la zone doit réussir un jet de sauvegarde de Dextérité sous peine de tomber à terre. Une créature qui entre dans la zone ou y termine son tour doit également réussir un jet de sauvegarde de Dextérité si elle ne veut pas tomber à terre.<br>"
	},
	{
		name: "Grande foulée",
		originalName: "Longstrider",
		castedBy: [
			"artificer",
			"bard",
			"druid",
			"ranger",
			"wizard"
		],
		id: "9b68d412-c0af-46bb-8395-29c0ba7fa759",
		level: 1,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (une pincée de terre)",
		duration: "1 heure",
		description: "Vous touchez une créature. La vitesse de la cible augmente de 3 mètres jusqu'à la fin du sort.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Hâte",
		originalName: "Haste",
		castedBy: [
			"artificer",
			"sorcerer",
			"wizard"
		],
		id: "cde71c46-f2ae-4ec5-a24b-c86f15f5ae37",
		level: 3,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (un copeau de racine de réglisse)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Choisissez une créature consentante visible dans la portée du sort. Jusqu'à la fin de la durée du sort, la vitesse de la cible est doublée, elle bénéficie d'un bonus de +2 à la CA, elle a un avantage à ses jets de sauvegarde de Dextérité, et elle obtient une action supplémentaire à chacun de ses tours. Cette action peut être utilisée pour Attaquer (une seule attaque avec une arme), Foncer, Se désengager, Se cacher ou Utiliser un objet.<br>Lorsque le sort prend fin, la cible ne peut plus bouger ou agir jusqu'à la fin de son prochain tour, car une vague de léthargie la submerge.<br>"
	},
	{
		name: "Identification",
		originalName: "Identify",
		castedBy: [
			"artificer",
			"bard",
			"wizard"
		],
		id: "76318292-7ffa-4157-884d-0760e5d60efc",
		level: 1,
		school: "divination",
		isRitual: true,
		castingTime: "1 minute",
		range: "contact",
		components: "V, S, M (une perle d'une valeur d'au moins 100 po et une plume de hibou)",
		duration: "instantanée",
		description: "Vous choisissez un objet que vous devez toucher durant toute la durée du sort. Si l'objet est magique ou imprégné de magie, vous apprenez ses propriétés et comment les utiliser, s'il requiert un lien pour être utilisé et le nombre de charges qu'il contient, le cas échéant. Vous apprenez si des sorts affectent l'objet et quels sont ces sorts. Si l'objet a été créé par un ou plusieurs sorts, vous apprenez quels sorts ont permis de le créer.<br>Si vous touchez une créature durant toute la durée du sort, au lieu d'un objet, vous apprenez quels sorts l'affectent actuellement, le cas échéant.<br>"
	},
	{
		name: "Invisibilité",
		originalName: "Invisibility",
		castedBy: [
			"artificer",
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "724a223c-f64c-415d-a0f5-7c9101d61467",
		level: 2,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (un cil enfoncé dans de la gomme arabique)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Une créature que vous touchez devient invisible jusqu'à la fin du sort. Tout ce que la cible porte est invisible tant que la cible le porte. Le sort se termine si la cible attaque ou lance un sort.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Lame aux flammes vertes",
		originalName: "Green-Flame Blade",
		castedBy: [
			"artificer",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "a6c824e7-8cc3-47ae-b109-006e33d844be",
		level: 0,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (rayon de 1,50 mètre)",
		components: "V, M (une arme de corps à corps valant au moins 1 pa)",
		duration: "instantanée",
		description: "Vous brandissez l'arme utilisée pour l'incantation du sort et effectuez une attaque au corps à corps avec cette arme contre une créature à 1,50 mètre ou moins de vous. Si vous touchez, la cible subit les effets normaux de l'attaque et une flamme verdâtre jaillit de cette cible pour aller frapper une autre créature de votre choix que vous pouvez voir et qui se trouve dans un rayon de 1,50 mètre autour de la première créature. Cette seconde créature subit des dégâts de feu d'un montant égal au modificateur de votre caractéristique d'incantation.<br>Les dégâts de ce sort augmentent suivant votre niveau. Au niveau 5, l'attaque de corps à corps inflige 1d8 dégâts de feu supplémentaires à la première cible, et les dégâts de feu subis par la seconde cible atteignent 1d8 + le modificateur de votre caractéristique d'incantation. Les deux jets de dégâts augmentent chacun de 1d8 supplémentaire aux niveaux 11 (2d8 et 2d8) et 17 (3d8 et 3d8).<br>"
	},
	{
		name: "Lame tonnante",
		originalName: "Booming Blade",
		castedBy: [
			"artificer",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "8da4b1cd-4f10-4af3-8202-62bac4d5cf1b",
		level: 0,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (rayon de 1,50 mètre)",
		components: "V, M (une arme de corps à corps valant au moins 1 pa)",
		duration: "1 round",
		description: "Vous brandissez l'arme utilisée pour l'incantation du sort et effectuez une attaque au corps à corps avec cette arme contre une créature à 1,50 mètre ou moins de vous. Si vous touchez, la cible subit les effets normaux de l'attaque et elle est enveloppée d'une énergie explosive jusqu'au début de votre prochain tour. Si la cible se déplace volontairement de 1,50 mètre ou plus pendant ce laps de temps, elle subit 1d8 dégâts de tonnerre et le sort se termine.<br>Les dégâts de ce sort augmentent suivant votre niveau. Au niveau 5, l'attaque au corps à corps inflige 1d8 dégâts de tonnerre supplémentaires à la cible, et les dégâts que la cible subit si elle se déplace passent à 2d8. Les deux jets de dégâts augmentent ensuite de 1d8 aux niveaux 11 (2d8 et 3d8) et 17 (3d8 et 4d8).<br>"
	},
	{
		name: "Lévitation",
		originalName: "Levitate",
		castedBy: [
			"artificer",
			"sorcerer",
			"wizard"
		],
		id: "48a4361e-3fef-4c96-b9ed-9e91aeff6e56",
		level: 2,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (une boucle de cuir ou un fil d'or plié en forme de tasse dont une extrémité s'étire)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Une créature ou un objet non tenu de votre choix, visible et à portée du sort, s'élève jusqu'à une hauteur de 6 mètres et reste suspendu pour la durée du sort. Le sort peut faire léviter une cible pesant jusqu'à 250 kg. Une créature récalcitrante qui réussit un jet de sauvegarde de Constitution n'est pas affectée.<br>La cible peut se déplacer seulement si elle se propulse ou se tire à l'aide d'un objet ou d'une surface à sa portée (comme un mur ou un plafond). Elle peut ainsi se déplacer comme si elle grimpait. Vous pouvez changer l'altitude jusqu'à 6 mètres dans une direction ou une autre à votre tour. Si vous êtes la cible, vous pouvez vous déplacer vers le haut ou vers le bas lors de votre mouvement. Autrement, vous pouvez utiliser votre action pour déplacer la cible, qui doit demeurer dans la portée du sort. Lorsque le sort prend fin, la cible rejoint doucement le sol si elle est toujours en suspension.<br>"
	},
	{
		name: "Liberté de mouvement",
		originalName: "Freedom of Movement",
		castedBy: [
			"artificer",
			"bard",
			"cleric",
			"druid",
			"ranger"
		],
		id: "925ca827-294c-4a06-8de6-d42f340b8c6b",
		level: 4,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (une lanière de cuir sanglée autour du bras ou un appendice semblable)",
		duration: "1 heure",
		description: "Vous touchez une créature consentante. Pour la durée du sort, les mouvements de la cible ne sont pas limités par un terrain difficile. Les sorts et autres effets magiques ne peuvent ni réduire la vitesse de la cible ni la rendre paralysée ou entravée.<br>La cible peut aussi dépenser 1,50 mètre de son mouvement pour se dégager d'une contrainte non magique, comme des menottes ou l'étreinte d'une créature. Enfin, l'environnement aquatique n'impose aucune pénalité sur les mouvements et les attaques de la cible.<br>"
	},
	{
		name: "Lueurs féeriques",
		originalName: "Faerie Fire",
		castedBy: [
			"artificer",
			"bard",
			"druid"
		],
		id: "183f2f0b-7a55-4677-be6b-78aa2ab86818",
		level: 1,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "Tous les objets à l'intérieur d'un cube de 6 mètres d'arête dans la portée du sort se distinguent par un halo bleu, vert ou violet (à votre choix). Toutes les créatures présentes dans la zone lors de l'incantation du sort sont également enveloppées du halo si elles échouent à un jet de sauvegarde de Dextérité. Pour la durée du sort, les objets et les créatures affectées émettent une lumière faible dans un rayon de 3 mètres.<br>Les jets d'attaque contre des créatures affectées ou des objets bénéficient d'un avantage si l'attaquant peut les voir. Les créatures affectées ou les objets ne peuvent bénéficier de la condition invisible.<br>"
	},
	{
		name: "Lumière",
		originalName: "Light",
		castedBy: [
			"artificer",
			"bard",
			"cleric",
			"sorcerer",
			"wizard"
		],
		id: "98ff3f94-c333-4047-bef6-55686f2a1d6f",
		level: 0,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, M (une luciole ou de la mousse phosphorescente)",
		duration: "1 heure",
		description: "Vous touchez un objet qui ne dépasse pas 3 mètres dans toutes les dimensions. Jusqu'à la fin du sort, l'objet émet une lumière vive dans un rayon de 6 mètres et une lumière faible sur 6 mètres supplémentaires. La lumière est de la couleur que vous voulez. Couvrir complètement l'objet avec quelque chose d'opaque bloque la lumière. Le sort se termine si vous le lancez de nouveau ou si vous le dissipez par une action.<br>Si vous ciblez un objet tenu ou porté par une créature hostile, cette créature doit réussir un jet de sauvegarde de Dextérité pour éviter le sort.<br>"
	},
	{
		name: "Lumières dansantes",
		originalName: "Dancing Lights",
		castedBy: [
			"artificer",
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "e65ed54f-922b-4ada-995a-7317c940a183",
		level: 0,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (un peu de phosphore ou d'écorce d'orme blanc, ou bien un ver luisant)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Ce sort permet de créer jusqu'à quatre lumières, de la taille de torches, qui peuvent revêtir l'apparence de torches, de lanternes ou d'orbes brillantes qui flottent dans les airs. Il est possible de combiner les quatre lumières en une forme vaguement humanoïde brillante de taille M. Peu importe la forme choisie, chaque lumière produit une lumière faible qui éclaire dans un rayon de 3 mètres.<br>Au prix d'une action bonus lors de votre tour, il est possible de déplacer les lumières jusqu'à 18 mètres vers un nouvel emplacement à portée. Une lumière doit se situer à 6 mètres ou moins d'une autre lumière créée par ce sort, et une lumière s'éclipse si elle se trouve au-delà de la portée du sort.<br>"
	},
	{
		name: "Main de Bigby",
		originalName: "Bigby's Hand",
		castedBy: [
			"artificer",
			"wizard"
		],
		id: "37ef8077-2153-4f4d-baa1-6a00513c82ab",
		level: 5,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (une coquille d'œuf et un gant en peau de serpent)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous créez une main de force luminescente et translucide de taille G dans un espace inoccupé à portée et que vous pouvez voir. La main reste pour la durée du sort, et elle se déplace selon vos ordres, reproduisant les mouvements de votre propre main.<br>La main est un objet ayant une CA de 20 et un nombre de points de vie égal à votre maximum de points de vie. Si elle tombe à 0 point de vie, le sort prend fin. Elle a une Force de 26 (+8) et une Dextérité de 10 (+0). La main ne remplit pas l'espace qu'elle occupe.<br>Lorsque vous lancez ce sort et par une action bonus aux tours qui suivent, vous pouvez déplacer la main jusqu'à 18 mètres puis lui appliquer l'un des effets suivants.<br><strong>Poing de Bigby</strong>. La main frappe une créature ou un objet à 1,50 mètre d'elle. Effectuez une attaque au corps à corps avec un sort pour la main en utilisant vos statistiques de jeu. Si l'attaque touche, la cible subit 4d8 dégâts de force.<br><strong>Main de force de Bigby</strong>. La main tente de pousser une créature située à 1,50 mètre d'elle, dans une direction de votre choix. Effectuez un jet de Force de la main contre un jet de Force (Athlétisme) de la cible. Si la cible est de taille M ou inférieure, vous avez un avantage au jet. Si vous gagnez l'opposition, la main repousse la cible sur une distance en mètre égale à 1,50 x (1 + le modificateur de votre caractéristique d'incantation). La main se déplace avec la cible pour rester à 1,50 mètre d'elle.<br><strong>Main broyeuse de Bigby</strong>. La main tente d'agripper une créature de taille G ou inférieure se trouvant à 1,50 mètre d'elle. Vous utilisez la Force de la main pour résoudre la tentative. Si la cible est de taille M ou inférieure, vous avez un avantage au jet. Tant que la main agrippe la cible, vous pouvez utiliser une action bonus pour que la main la broie. Lorsque vous faites ainsi, la cible subit un nombre de points de dégâts contondants égal à 2d6 + le modificateur de votre caractéristique d'incantation.<br><strong>Main d'interposition de Bigby</strong>. La main s'interpose entre vous et une créature de votre choix jusqu'à ce que vous donniez à la main un ordre différent. La main se déplace de sorte à toujours rester entre vous et la cible, vous donnant un abri partiel contre la cible. La cible ne peut pas se déplacer au travers de l'espace occupé par la main si sa valeur de Force est inférieure ou égale à celle de la main. Si la valeur de Force de la cible est supérieure à celle de la main, elle peut se déplacer dans votre direction en traversant l'espace de la main, mais son espace est considéré comme étant un terrain difficile pour la cible.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 6 ou supérieur, les dégâts du Poing de Bigby augmentent de 2d8 et les dégâts de la Main broyeuse de Bigby augmentent de 2d6, et ce pour chaque emplacement de niveau supérieur au 5eme.<br>"
	},
	{
		name: "Main de mage",
		originalName: "Mage Hand Main du mage",
		castedBy: [
			"artificer",
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "3f59753f-b250-4cd4-9cd9-a2c520a44ee1",
		level: 0,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S",
		duration: "1 minute",
		description: "Une main spectrale apparaît à un point précis choisi à portée. La main expire à la fin de la durée du sort ou si elle est révoquée au prix d'une action. La main disparaît si elle se retrouve à plus de 9 mètres du lanceur de sorts ou si ce sort est jeté une nouvelle fois.<br>Le lanceur de sorts peut utiliser son action pour contrôler la main. La main peut manipuler un objet, ouvrir une porte ou un contenant non verrouillé, ranger ou récupérer un objet d'un contenant ouvert, ou bien verser le contenu d'une fiole. La main peut être déplacée jusqu'à 9 mètres à chaque fois que vous l'utilisez.<br>La main ne peut attaquer, activer des objets magiques ou transporter plus de 5 kg.<br>"
	},
	{
		name: "Marche sur l'eau",
		originalName: "Water Walk Marche sur l'onde",
		castedBy: [
			"artificer",
			"cleric",
			"druid",
			"ranger",
			"sorcerer"
		],
		id: "0b1107b5-733f-491b-9961-f44d8670a872",
		level: 3,
		school: "transmutation",
		isRitual: true,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (un morceau de liège)",
		duration: "1 heure",
		description: "Le sort attribue la capacité de se déplacer sur toute surface liquide (eau, acide, boue, neige, sables mouvants, lave, etc.) comme si c'était un sol dur. Les créatures qui traversent de la lave en fusion subissent tout de même les dégâts dus à la chaleur. Jusqu'à dix créatures consentantes et que vous pouvez voir dans la portée du sort obtiennent cette capacité pour la durée du sort.<br>Si vous ciblez une créature submergée dans un liquide, le sort déplace la cible vers la surface du liquide à une vitesse de 18 mètres par round.<br>"
	},
	{
		name: "Message",
		originalName: "Message",
		castedBy: [
			"artificer",
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "0a96868d-e586-4bc3-b70e-99219cd6541c",
		level: 0,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (un petit bout de fil de cuivre)",
		duration: "1 round",
		description: "Vous pointez votre doigt en direction d'une créature à portée et murmurez un message. La cible (et seulement la cible) entend le message et peut répondre en un murmure que vous seul pouvez entendre. Vous pouvez lancer ce sort à travers des objets solides si vous connaissez bien la cible et que vous savez qu'elle est derrière l'obstacle. Ce sort est arrêté par un silence magique, 30 cm de pierre, 2,50 cm de métal, une fine feuille de plomb ou 90 cm de bois. Ce sort ne doit pas forcément suivre une ligne droite et peut contourner les angles ou passer par de petites ouvertures.<br>"
	},
	{
		name: "Métal brûlant",
		originalName: "Heat Metal",
		castedBy: [
			"artificer",
			"bard",
			"druid"
		],
		id: "a4dfd66b-55ab-477b-b113-7f30a863859d",
		level: 2,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (un morceau de fer et une flamme)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Choisissez un objet métallique manufacturé, comme une arme en métal ou une armure métallique intermédiaire ou lourde, à portée et que vous pouvez voir. Vous rendez l'objet rougeoyant d'une intense chaleur. Toutes les créatures étant en contact physique avec l'objet subissent 2d8 dégâts de feu au moment où vous lancez le sort. Jusqu'à la fin du sort, vous pouvez utiliser votre action bonus à chacun des tours suivants pour infliger de nouveau ces dégâts de feu.<br>Si une créature tient ou porte l'objet et en subit les dégâts de feu, la créature doit réussir un jet de sauvegarde de Constitution sous peine de lâcher l'objet si elle le peut. Si elle ne peut pas se séparer de l'objet, elle obtient un désavantage à ses jets d'attaque et à ses jets de caractéristique jusqu'au début de votre prochain tour.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, les dégâts sont augmentés de 1d8 pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Modification d'apparence",
		originalName: "Alter Self",
		castedBy: [
			"artificer",
			"sorcerer",
			"wizard"
		],
		id: "2cd0126b-f759-49f8-85ae-f6894fabc626",
		level: 2,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous endossez une nouvelle forme. Lorsque vous lancez ce sort, choisissez l'une des options suivantes, dont les effets s'appliqueront jusqu'à ce que le sort prenne fin. Tant que le sort est actif, vous pouvez mettre un terme à une option, en dépensant une action, pour gagner les bénéfices d'une option différente.<br><strong><em>Adaptation aquatique</em></strong>. Vous adaptez votre corps à un environnement aquatique, en vous faisant pousser des branchies et des expansions palmaires entre les doigts. Vous pouvez respirer sous l'eau et obtenez une vitesse de nage égale à votre vitesse de marche.<br><strong><em>Changement d'apparence</em></strong>. Vous transformez votre apparence. Vous décidez à quoi vous ressemblez, que ce soit votre taille, votre poids, les traits de votre visage, le son de votre voix, la longueur de vos cheveux, votre pigmentation, et vos signes distinctifs, le cas échéant. Vous pouvez prendre l'apparence d'un membre d'une autre race, sans répercussions sur vos caractéristiques ou autres traits raciaux. Vous ne pouvez pas prendre l'apparence d'une créature d'une catégorie de taille différente de la vôtre, et votre forme de base doit rester la même ; si vous êtes un bipède, vous ne pouvez pas utiliser ce sort pour devenir quadrupède par exemple. À tout moment pendant la durée du sort, vous pouvez utiliser votre action pour modifier de nouveau votre apparence.<br><strong><em>Armes naturelles</em></strong>. Vous vous dotez de griffes, crocs, épines, cornes ou d'une autre arme naturelle de votre choix. Votre attaque à mains nues inflige 1d6 dégâts contondants, perforants ou tranchants, suivant ce qui est le plus approprié à l'arme naturelle que vous avez choisie, et vous obtenez la maîtrise de votre attaque à mains nues. Enfin, votre arme naturelle est une arme magique et a un bonus de +1 aux jets d'attaque et de dégâts.<br>"
	},
	{
		name: "Mur de pierre",
		originalName: "Wall of Stone",
		castedBy: [
			"artificer",
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "d94037fd-b424-4b4f-b807-f21a5a1fe8af",
		level: 5,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (un petit bloc de granite)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Un mur non magique de pierre solide émerge à un point que vous choisissez dans la portée. Le mur fait 15 cm d'épaisseur et est composé de dix panneaux de 3 mètres sur 3 mètres. Chaque panneau doit être contigu avec au moins un autre panneau. Vous pouvez aussi créer des panneaux de 3 mètres par 6 mètres qui ne font que de 7,50 cm d'épaisseur.<br>Si le mur traverse l'espace d'une créature quand il apparaît, la créature est poussée d'un côté du mur (à votre choix). Si une créature devrait être entourée de tous côtés par le mur (ou par le mur et une autre surface solide), cette créature peut alors faire un jet de sauvegarde de Dextérité. En cas de réussite, elle peut utiliser sa réaction pour se déplacer de sa vitesse et éviter que la paroi ne l'entoure complètement.<br>Le mur peut prendre la forme que vous désirez, mais il ne peut pas occuper l'espace d'une créature ou d'un objet. Le mur ne doit pas forcément être vertical ou posséder des fondations fermes. Cependant, il doit reposer solidement sur de la pierre existante. Ainsi, vous pouvez utiliser ce sort pour créer un pont qui enjambe un gouffre ou créer une rampe.<br>Si vous créez une envergure supérieure à 6 mètres de longueur, vous devez réduire de moitié la taille de chaque panneau pour créer des supports. Vous pouvez façonner grossièrement le mur pour créer des créneaux, des remparts, etc.<br>Le mur est un objet de pierre qui peut être endommagé et donc ébréché. Chaque panneau a une CA de 15 et 30 points de vie par tranche de 2,50 cm. Réduire un panneau à 0 point de vie le détruit et pourrait provoquer l'effondrement des autres panneaux qui lui sont reliés, à la discrétion du MD.<br>Si vous maintenez votre concentration sur ce sort pendant toute sa durée, le mur devient permanent et ne peut plus être dissipé. Sinon, le mur disparaît lorsque le sort se termine.<br>"
	},
	{
		name: "Oeil magique",
		originalName: "Arcane Eye Oeil du mage",
		castedBy: [
			"artificer",
			"wizard"
		],
		id: "04b0785f-343c-43a7-bf1b-9619ce3a366d",
		level: 4,
		school: "divination",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (quelques poils de chauve-souris)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous créez un œil invisible et magique à portée qui flotte dans l'air pendant la durée du sort.<br>Vous recevez une image mentale de ce que peut voir l'œil qui possède une vision normale et une vision dans le noir jusqu'à 9 mètres. L'œil peut voir dans toutes les directions.<br>Par une action, vous pouvez faire avancer l'œil de 9 mètres dans n'importe quelle direction. Il n'y a aucune limite d'éloignement entre vous et l'œil, mais celui-ci ne peut changer de plan d'existence. Les obstacles solides bloquent le mouvement mais l'œil peut passer à travers n'importe quelle ouverture d'un diamètre 2,50 cm ou plus.<br>"
	},
	{
		name: "Pattes d'araignée",
		originalName: "Spider Climb",
		castedBy: [
			"artificer",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "2327d47f-059d-4daa-baa0-5ba8faafd8d8",
		level: 2,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (une goutte de bitume et une araignée)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Jusqu'à ce que le sort se termine, une créature consentante que vous touchez gagne la capacité de se déplacer vers le haut, le bas, et le long de surfaces verticales ou encore à l'envers aux plafonds, tout en laissant ses mains libres. La cible gagne également une vitesse d'escalade égale à sa vitesse de marche.<br>"
	},
	{
		name: "Peau de pierre",
		originalName: "Stoneskin",
		castedBy: [
			"artificer",
			"druid",
			"ranger",
			"sorcerer",
			"wizard"
		],
		id: "77b89792-1b8d-40a4-8312-652d321f608a",
		level: 4,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (de la poussière de diamant d'une valeur d'au moins 100 po, que le sort consomme)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Ce sort transforme la chair d'une créature consentante que vous touchez en un revêtement aussi dur que la pierre. Jusqu'à ce que le sort se termine, la cible obtient la résistante aux dégâts non magiques contondants, perforants et tranchants.<br>"
	},
	{
		name: "Pierre magique",
		originalName: "Magic Stone",
		castedBy: [
			"artificer",
			"druid",
			"warlock"
		],
		id: "16dfab24-47b2-450c-aad8-40d4deb092ad",
		level: 0,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "contact",
		components: "V, S",
		duration: "1 minute",
		description: "Vous touchez un à trois cailloux et les imprégnez de magie. Vous ou quelqu'un d'autre peut faire une attaque à distance avec un sort avec un des ces cailloux en le jetant à la main ou en le lançant à l'aide d'une fronde. S'il est jeté, sa portée est de 18 mètres. Si quelqu'un d'autre attaque avec ces cailloux, il ajoute le modificateur de votre caractéristique d'incantation au jet d'attaque (et non pas la sienne). Si le coup touche, la cible prend 1d6 dégâts contondants + le modificateur de votre caractéristique d'incantation. Dans tous les cas, le caillou perd ses propriétés magiques.<br>Si vous lancez ce sort à nouveau, le sort s'arrête pour tous les cailloux encore sous effet magique du sort précédent.<br>"
	},
	{
		name: "Poigne électrique",
		originalName: "Shocking Grasp",
		castedBy: [
			"artificer",
			"sorcerer",
			"wizard"
		],
		id: "d5b12cca-02e0-40f5-ae62-bf0696ecba97",
		level: 0,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "instantanée",
		description: "La foudre jaillit de votre main pour délivrer un choc électrique à une créature que vous essayez de toucher. Effectuez une attaque au corps à corps avec un sort contre la cible. Vous avez un avantage au jet d'attaque si la cible porte une armure en métal. En cas de réussite, la cible prend 1d8 dégâts de foudre, et elle ne peut pas prendre de réaction jusqu'au début de son prochain tour.<br>Les dégâts du sort augmentent de 1d8 lorsque vous atteignez le niveau 5 (2d8), le niveau 11 (3d8) et le niveau 17 (4d8).<br>"
	},
	{
		name: "Prestidigitation",
		originalName: "Prestidigitation",
		castedBy: [
			"artificer",
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "9ccb11e8-1bc9-4579-a2f6-fd303a7d9ba9",
		level: 0,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "3 mètres",
		components: "V, S",
		duration: "jusqu'à 1 heure",
		description: "Ce sort est un tour de magie mineur que les lanceurs de sorts novices emploient comme exercice. Ce sort permet de provoquer l'un des effets magiques suivants :<br>• Le sort crée instantanément un effet sensoriel inoffensif, comme une pluie d'étincelles, une bouffée d'air, de timides notes de musique, ou une étrange odeur.<br>• Le sort allume ou éteint instantanément une bougie, torche ou un petit feu de camp.<br>• Le sort nettoie ou souille instantanément un objet pas plus volumineux qu'un cube de 30 cm d'arête.<br>• Le sort réchauffe, refroidit ou assaisonne du matériel non vivant pouvant être contenu dans un cube de 30 cm d'arête pendant 1 heure.<br>• Le sort fait apparaître un symbole, une petite marque ou couleur sur un objet ou une surface pendant 1 heure.<br>• Le sort permet de créer une babiole non magique ou une image illusoire qui peut tenir dans votre main et qui dure jusqu'à la fin de votre prochain tour.<br>Si le sort est lancé plusieurs fois, il est possible de conserver actifs 3 de ces effets non instantanés simultanément, et il est possible de révoquer ces effets au prix d'une action.<br>"
	},
	{
		name: "Protection contre le poison",
		originalName: "Protection from Poison",
		castedBy: [
			"artificer",
			"cleric",
			"druid",
			"paladin",
			"ranger"
		],
		id: "6f0414ef-e61c-486f-bf2f-0e46449446cb",
		level: 2,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "1 heure",
		description: "Vous touchez une créature. Si elle est empoisonnée, vous neutralisez le poison. Si plus d'un poison affecte la cible, vous neutralisez un des poisons dont vous êtes conscient de la présence, sinon vous neutralisez l'un des poisons au hasard.<br>Pour toute la durée du sort, la cible a un avantage à ses jets de sauvegarde effectués pour éviter d'être empoisonnée, et a une résistance aux dégâts de poison.<br>"
	},
	{
		name: "Protection contre une énergie",
		originalName: "Protection from Energy Protection contre l'énergie",
		castedBy: [
			"artificer",
			"cleric",
			"druid",
			"ranger",
			"sorcerer",
			"wizard"
		],
		id: "c9770c70-a42b-4cc4-8e82-b44514410ec3",
		level: 3,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Pour la durée du sort, une créature consentante que vous touchez bénéficie d'une résistance à un type de dégâts de votre choix : acide, froid, feu, foudre ou tonnerre.<br>"
	},
	{
		name: "Purification de nourriture et d'eau",
		originalName: "Purify Food and Drink Purification de la nourriture et de l'eau",
		castedBy: [
			"artificer",
			"cleric",
			"druid",
			"paladin"
		],
		id: "d83b04db-ddc6-4a3e-ad30-c6a8e2251c3b",
		level: 1,
		school: "transmutation",
		isRitual: true,
		castingTime: "1 action",
		range: "3 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Toute la nourriture et toutes les boissons, non magiques, se trouvant dans une sphère de 1,50 mètre de rayon, et centrée sur un point de votre choix à portée, sont purifiées et débarrassées de tout poison et de toute maladie.<br>"
	},
	{
		name: "Pyrotechnie",
		originalName: "Pyrotechnics",
		castedBy: [
			"artificer",
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "e1ef7e43-19cb-4bf9-9e10-c5544a03e223",
		level: 2,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Visez une zone de flammes non magiques qui rentre dans un cube de 1,50 mètre d'arête et que vous pouvez voir. Vous pouvez au choix éteindre le feu ou créer des feux d'artifice ou de la fumée dans ce cas.<br><strong>Feux d'artifice</strong>. La cible explose dans un chatoiement de couleurs. Chaque créature à 3 mètres ou moins de la cible doit réussir un jet de sauvegarde de Constitution ou être aveuglée jusqu'à la fin de votre prochain tour.<br><strong>Fumée</strong>. Une épaisse fumée s'échappe de la cible dans un rayon de 7,50 mètres, remplissant chaque recoin de la zone. La visibilité dans la zone enfumée est nulle. La fumée dure une minute ou jusqu'à ce qu'un fort vent la dissipe.<br>"
	},
	{
		name: "Rayon de givre",
		originalName: "Ray of Frost",
		castedBy: [
			"artificer",
			"sorcerer",
			"wizard"
		],
		id: "a55cc032-48f1-439e-a19b-4547189a452f",
		level: 0,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Un faisceau frigide de lumière bleuâtre se dirige vers une créature dans la portée du sort. Effectuez une attaque à distance avec un sort contre la cible. S'il touche, la cible subit 1d8 dégâts de froid et sa vitesse est réduite de 3 mètres jusqu'à début de votre prochain tour.<br>Les dégâts du sort augmentent de 1d8 lorsque vous atteignez le niveau 5 (2d8), le niveau 11 (3d8) et le niveau 17 (4d8).<br>"
	},
	{
		name: "Réparation",
		originalName: "Mending",
		castedBy: [
			"artificer",
			"bard",
			"cleric",
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "8cc26ea7-c8e7-43a6-9e5a-389ee57a2d05",
		level: 0,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 minute",
		range: "contact",
		components: "V, S, M (deux aimants)",
		duration: "instantanée",
		description: "Ce sort répare une simple fissure, déchirure ou fêlure sur un objet que vous touchez, comme un maillon de chaîne cassé, une clé brisée en deux morceaux, un accroc sur un manteau ou une fuite sur une outre. Tant que la fissure ou l'accroc n'excède pas 30 cm dans toutes les dimensions, vous le réparez, ne laissant aucune trace de la détérioration passée. Ce sort peut réparer physiquement un objet magique ou un  artificiel, mais ne peut pas rendre sa magie à un objet.<br>"
	},
	{
		name: "Repli expéditif",
		originalName: "Expeditious Retreat",
		castedBy: [
			"artificer",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "d7d5b882-a4ee-4e51-a26f-1fb2755b4b08",
		level: 1,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V, S",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Ce sort vous permet de vous déplacer à une vitesse incroyable. Lorsque vous lancez ce sort, puis par une action bonus à chacun de vos tours jusqu'à la fin du sort, vous pouvez effectuer l'action Foncer.<br>"
	},
	{
		name: "Résistance",
		originalName: "Resistance",
		castedBy: [
			"artificer",
			"cleric",
			"druid"
		],
		id: "68f672a1-6a3a-4da4-a0bc-bf39b5aaa175",
		level: 0,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (une cape miniature)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous touchez une créature consentante. Une fois avant la fin du sort, la cible peut lancer un d4 et ajouter le résultat du dé à un jet de sauvegarde de son choix. Elle peut lancer le dé avant ou après avoir effectué son jet de sauvegarde. Le sort prend alors fin.<br>"
	},
	{
		name: "Respiration aquatique",
		originalName: "Water Breathing",
		castedBy: [
			"artificer",
			"druid",
			"ranger",
			"sorcerer",
			"wizard"
		],
		id: "9951c3b4-f842-4a10-9132-27d468f7a410",
		level: 3,
		school: "transmutation",
		isRitual: true,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (un court roseau ou un morceau de paille)",
		duration: "24 heures",
		description: "Ce sort procure à un maximum de dix créatures consentantes, à portée et que vous pouvez voir, la capacité de respirer sous l'eau jusqu'à la fin de sa durée. Les créatures affectées conservent également leur mode de respiration normale.<br>"
	},
	{
		name: "Restauration partielle",
		originalName: "Lesser Restoration",
		castedBy: [
			"artificer",
			"bard",
			"cleric",
			"druid",
			"paladin",
			"ranger"
		],
		id: "1ec71693-f5fc-47b3-9fe3-1f6ee25ff685",
		level: 2,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "instantanée",
		description: "Vous touchez une créature et vous pouvez mettre fin à une maladie ou à une condition l'affligeant. La condition peut être aveuglé, assourdi, paralysé ou empoisonné.<br>"
	},
	{
		name: "Restauration supérieure",
		originalName: "Greater Restoration Restauration suprême",
		castedBy: [
			"artificer",
			"bard",
			"cleric",
			"druid"
		],
		id: "82f1e89e-5f21-46d4-bc55-7ac70960749e",
		level: 5,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (de la poussière de diamant valant au moins 100 po, que le sort consomme)",
		duration: "instantanée",
		description: "Vous imprégnez une créature que vous touchez d'une énergie positive afin d'annuler un effet débilitant. Vous pouvez réduire de un le niveau d'épuisement de la cible, ou mettre un terme aux effets suivants affligeant la cible :<br>• Un effet de charme ou de pétrification de la cible<br>• Une malédiction, incluant le lien de la cible avec un objet magique maudit<br>• Toute réduction à l'une des valeurs de caractéristique de la cible<br>• Un effet qui réduit le maximum de points de vie de la cible<br>"
	},
	{
		name: "Retour à la vie",
		originalName: "Revivify",
		castedBy: [
			"artificer",
			"cleric",
			"paladin"
		],
		id: "ef29dac6-3818-4ed2-bde5-900db1573655",
		level: 3,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (un diamant valant au moins 300 po, que le sort consomme)",
		duration: "instantanée",
		description: "Vous touchez une créature morte depuis au plus une minute. Cette créature revient à la vie avec 1 point de vie. Ce sort ne peut ni ramener à la vie une créature morte de vieillesse ni restaurer des parties perdues du corps.<br>"
	},
	{
		name: "Sanctuaire",
		originalName: "Sanctuary",
		castedBy: [
			"artificer",
			"cleric"
		],
		id: "8d9e5fd4-c702-4d99-a1e3-8cc9f60cd1a1",
		level: 1,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "9 mètres",
		components: "V, S, M (un petit miroir en argent)",
		duration: "1 minute",
		description: "Vous protégez une créature dans la portée du sort contre les attaques. Jusqu'à ce que le sort se termine, toute créature qui cible la créature protégée avec une attaque ou un sort offensif doit d'abord effectuer un jet de sauvegarde de Sagesse. En cas d'échec, la créature doit choisir une nouvelle cible ou perdre son attaque ou son sort. Ce sort ne protège pas la créature protégée contre les sorts à zone d'effet, tel que l'explosion d'une boule de feu.<br>Si la créature protégée fait une attaque, lance un sort qui affecte une créature ennemie ou inflige des dégâts à une autre créature, ce sort se termine.<br>"
	},
	{
		name: "Sanctuaire privé de Mordenkainen",
		originalName: "Mordenkainen's Private Sanctum",
		castedBy: [
			"artificer",
			"wizard"
		],
		id: "3557db26-0899-4de4-8fe9-c285c4428488",
		level: 4,
		school: "abjuration",
		isRitual: false,
		castingTime: "10 minutes",
		range: "36 mètres",
		components: "V, S, M (une mince feuille de plomb, un morceau de verre opaque, un bout de coton ou d'étoffe, et de la chrysolite réduite en poudre)",
		duration: "24 heures",
		description: "Vous créez, à portée, une zone sécurisée magiquement. La zone est un cube de 1,50 mètre d'arête minimum à 30 mètres d'arête maximum. L'effet reste actif pour toute la durée du sort ou jusqu'à ce que vous le dissipiez en utilisant une action.<br>Lorsque vous lancez ce sort, vous décidez quelle sorte de sécurité il confère en choisissant une ou plusieurs options parmi les suivantes&nbsp;:<br>• Les sons ne peuvent pas traverser la barrière située à la limite de la zone d'effet du sort.<br>• La barrière de la zone d'effet est matérialisée en une nappe de fumée noirâtre, bloquant ainsi la vision (y compris la vision dans le noir) au travers.<br>• Les capteurs ou détecteurs créés par des sorts de divination ne peuvent pas apparaître à l'intérieur de la zone protégée ou passer au travers de la barrière située à son périmètre.<br>• Les créatures dans la zone ne peuvent pas être la cible de sorts de divination.<br>• Rien ne peut se téléporter à l'intérieur de la zone protégée, pour y entrer ou pour en sortir.<br>• Le voyage planaire est bloqué dans l'enceinte de la zone protégée.<br>Lancer ce sort au même endroit, tous les jours pendant un an, rend son effet permanent.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 5 ou supérieur, vous pouvez augmenter la taille du cube de 30 mètres pour chaque niveau d'emplacement au-delà du niveau 4. Ainsi vous pourriez protéger un cube de 60 mètres d'arête en utilisant un emplacement de sort de niveau 5.<br>"
	},
	{
		name: "Saut",
		originalName: "Jump",
		castedBy: [
			"artificer",
			"druid",
			"ranger",
			"sorcerer",
			"wizard"
		],
		id: "9d3aa8d9-de64-42a2-a0c7-5f3ac1dd21fb",
		level: 1,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (la patte postérieure d'une sauterelle)",
		duration: "1 minute",
		description: "Vous touchez une créature. La distance de saut de la créature est triplée pour la durée du sort.<br>"
	},
	{
		name: "Serviteur miniature",
		originalName: "Tiny Servant",
		castedBy: [
			"artificer",
			"wizard"
		],
		id: "a021b47d-e1e8-4e43-b66c-e8b1eff525ce",
		level: 3,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 minute",
		range: "contact",
		components: "V, S",
		duration: "8 heures",
		description: "Transforme un objet de taille TP en une créature avec bras et jambes qui obéit au lanceur (+2 objets/niv)."
	},
	{
		name: "Sieste",
		originalName: "Catnap",
		castedBy: [
			"artificer",
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "6a9151f1-58e4-44ef-afaf-85774609a11b",
		level: 3,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "S, M (une pincée de sable)",
		duration: "10 minute",
		description: "Vous faites un geste apaisant et jusqu'à trois créatures volontaires de votre choix que vous pouvez voir à portée tombent inconscientes pour la durée du sort. Le sort se termine de manière anticipée pur un cible si elle subit des dégâts ou si quelqu'un utilise une action pour la secouer ou la réveiller. Si une cible reste inconsciente pendant toute la durée du sort, elle bénéficie des effets d'un repos court. Elle ne peut plus être affectée par ce sort tant qu'elle n'a pas terminé un repos long.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, vous pouvez cibler une créature volontaire supplémentaire pour chaque niveau d'emplacement au-delà du niveau 3.<br>"
	},
	{
		name: "Simulacre de vie",
		originalName: "False Life",
		castedBy: [
			"artificer",
			"sorcerer",
			"wizard"
		],
		id: "053df2df-518e-4a97-aeee-65046aad7003",
		level: 1,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (une petite quantité d'alcool ou de spiritueux)",
		duration: "1 heure",
		description: "Vous vous protégez avec un semblant nécromantique de vie. Vous gagnez 1d4 + 4 points de vie temporaires pour la durée du sort.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, vous gagnez 5 points de vie temporaires supplémentaires pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Soins",
		originalName: "Cure Wounds",
		castedBy: [
			"artificer",
			"bard",
			"cleric",
			"druid",
			"paladin",
			"ranger"
		],
		id: "c62c287c-81d4-4da8-8a86-79172e28fd96",
		level: 1,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "instantanée",
		description: "Une créature que vous touchez récupère un nombre de points de vie égal à 1d8 + le modificateur de votre caractéristique d'incantation. Ce sort n'a pas d'effet sur les morts-vivants et les artificiels.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, la quantité de points de vie récupérés est augmentée de 1d8 pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Sphère résiliente d'Otiluke",
		originalName: "Otiluke's Resilient Sphere",
		castedBy: [
			"artificer",
			"wizard"
		],
		id: "0cd55bff-d2f6-4ed9-9fa7-545f520e9988",
		level: 4,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (un hémisphère de cristal et un hémisphère assorti de gomme arabique)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Une chatoyante sphère de force cloître une créature ou un objet de taille G ou inférieure à portée. Une créature non-consentante doit effectuer un jet de sauvegarde de Dextérité. En cas d'échec, la créature est emprisonnée pour la durée du sort.<br>Rien (que ce soit un objet physique, de l'énergie, ou les effets d'un sort) ne peut passer au travers de la barrière, pour en sortir ou pour y entrer, cependant une créature dans la sphère peut respirer normalement. La sphère est immunisée à tous les dégâts, et une créature ou objet présent dans la sphère ne peut pas être endommagé par une attaque ou un effet provenant de l'extérieur, de même, une créature à l'intérieur de la sphère ne peut pas faire de dommage à l'extérieur.<br>La sphère n'a pas de poids et est tout juste assez large pour contenir la créature ou l'objet qu'elle emprisonne. Une créature cloîtrée peut utiliser son action pour pousser contre la paroi de la sphère et ainsi faire rouler la sphère de la moitié de sa vitesse de déplacement. De la même manière, le globe peut être poussé et ainsi déplacé par les autres créatures.<br>Un sort de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=desintegration\">désintégration</a></em> ciblant le globe le détruit sans rien endommager de ce qu'il contient.<br>"
	},
	{
		name: "Stabilisation",
		originalName: "Spare the Dying",
		castedBy: [
			"artificer",
			"cleric"
		],
		id: "bbf29f22-2206-48b5-9118-ddbd3357e2fa",
		level: 0,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "instantanée",
		description: "Vous touchez une créature vivante qui est à 0 point de vie. La créature devient stable. Ce sort n'a pas d'effet sur les morts-vivants et les artificiels.<br>"
	},
	{
		name: "Toile d'araignée",
		originalName: "Web",
		castedBy: [
			"artificer",
			"sorcerer",
			"wizard"
		],
		id: "bafd2e7f-0b6f-41c1-9b35-e2220fa09207",
		level: 2,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (un peu de toile d'araignée)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous invoquez une masse de toiles d'araignées épaisse et collante à un point de votre choix dans la portée du sort. Les toiles remplissent un cube de 6 mètres d'arête à cet endroit pendant la durée du sort. Les toiles sont considérées comme un terrain difficile et la visibilité y est réduite.<br>Si les toiles ne sont pas ancrées entre deux masses solides (comme des murs ou des arbres) ou superposées à partir du sol, d'un mur ou du plafond, la masse de toiles invoquée s'effondre sur elle-même et le sort se termine au début de votre prochain tour. Les toiles superposées sur une surface plane ont une épaisseur de 1,50 mètre.<br>Chaque créature qui commence son tour dans les toiles ou qui y entre au cours de son tour doit faire un jet de sauvegarde de Dextérité. En cas d'échec, la créature est entravée aussi longtemps qu'elle demeure dans les toiles ou jusqu'à ce qu'elle se libère.<br>Une créature entravée par les toiles peut utiliser son action pour faire un jet de Force contre le DD de sauvegarde de votre sort. Si elle réussit, elle n'est plus entravée.<br>Les toiles sont inflammables. Un cube de toiles de 1,50 mètre d'arête exposé au feu se consume en un round, causant 2d4 dégâts de feu à toute créature commençant son tour dans les toiles enflammées.<br>"
	},
	{
		name: "Trait de feu",
		originalName: "Fire Bolt",
		castedBy: [
			"artificer",
			"sorcerer",
			"wizard"
		],
		id: "f5678c6c-56c8-48ae-9cd1-fa0f274991fc",
		level: 0,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous lancez un trait de feu sur une créature ou un objet à portée. Faites une attaque à distance avec un sort contre la cible. En cas de réussite, la cible prend 1d10 dégâts de feu. Un objet inflammable touché par ce sort prend feu s'il n'est pas porté.<br>Les dégâts du sort augmentent de 1d10 aux niveaux 5 (2d10), 11 (3d10) et 17 (4d10).<br>"
	},
	{
		name: "Transmutation de la pierre",
		originalName: "Transmute Rock",
		castedBy: [
			"artificer",
			"druid",
			"wizard"
		],
		id: "f8632012-6e9d-4de2-bf4d-767cf1883348",
		level: 5,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (de l'argile et de l'eau)",
		duration: "jusqu'à dissipation",
		description: "Vous choisissez une zone de roche ou de boue visible qui peut être contenue dans un cube de 12 mètres d'arête dans la portée du sort et vous choisissez un des effets suivants :<br><strong>Transmutation de la roche en boue</strong>. Toute roche non magique dans la zone devient un volume égal de boue épaisse et fluide qui demeure jusqu'à la fin du sort.<br>Le sol dans la zone du sort devient si boueux que les créatures peuvent s'y enfoncer. Toute créature se déplaçant dans cette boue voit chaque mètre de déplacement lui en coûter quatre. Toute créature dans la zone d'effet du sort lorsque vous le lancez doit faire un jet de sauvegarde de Force. Une créature doit également faire le jet de sauvegarde lorsqu'elle se déplace dans la zone pour la première fois dans un tour ou si elle y termine son tour. En cas d'échec, la créature s'enfonce dans la boue et est entravée, cependant elle peut dépenser une action pour se sortir de la boue et faire cesser cet état préjudiciable.<br>Si vous lancez le sort sur un plafond, la boue tombe. Toute créature sous cette pluie de boue doit faire un jet de sauvegarde de Dextérité. Elle subit 4d8 dégâts contondants en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br><strong>Transmutation de la boue en roche</strong>. De la boue ou des sables mouvants dans la zone se transforment en pierre tendre sur un maximum de 3 mètres de profondeur pour la durée du sort. Toute créature dans la zone lorsque la boue se transforme doit faire un jet de sauvegarde de Dextérité. En cas de réussite au jet de sauvegarde, la créature est déplacée de façon sûre vers un espace inoccupé. En cas d'échec, la créature se retrouve entravée par la roche. Une créature restrainte, ou une autre créature à portée, peut utiliser une action pour tenter de briser le rocher en réussissant un jet de Force DD 20 ou en lui infligeant des dégâts. Le rocher a une CA de 15, 25 points de vie, et est immunisé contre le poison et les dégâts psychiques.<br>"
	},
	{
		name: "Vaporisation de poison",
		originalName: "Poison Spray Bouffée de poison",
		castedBy: [
			"artificer",
			"druid",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "47b1e779-13a1-4048-8f51-2b7915f100e3",
		level: 0,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "3 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous tendez votre paume vers une créature visible dans la portée du sort et vous projetez une bouffée de gaz nocif de votre main. La créature doit réussir un jet de sauvegarde de Constitution ou subir 1d12 dégâts de poison.<br>Les dégâts de ce sort augmentent de 1d12 lorsque vous atteignez le niveau 5 (2d12), le niveau 11 (3d12) et le niveau 17 (4d12).<br>"
	},
	{
		name: "Verrou magique",
		originalName: "Arcane Lock",
		castedBy: [
			"artificer",
			"wizard"
		],
		id: "5c40952c-f398-4b98-a54a-9958c6a727bd",
		level: 2,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (de la poudre d'or d'une valeur d'au moins de 25 po, que le sort consomme)",
		duration: "jusqu'à dissipation",
		description: "Vous touchez un objet fermé comme une porte, une fenêtre, un portail ou un coffre, et celui-ci se retrouve verrouillé pour la durée du sort. Vous et les créatures que vous désignez lors du lancement du sort pouvez ouvrir l'objet normalement. Vous pouvez aussi créer un mot de passe qui, quand il est prononcé à 1,50 mètre ou moins de l'objet, supprime l'effet du sort pendant 1 minute. Autrement, il est impossible de passer l'objet, sauf s'il est brisé ou si le sort est dissipé ou prend fin. Lancer le sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=deblocage\">déblocage</a></em> supprime <em>verrou magique</em> pendant 10 minutes.<br>L'objet affecté par le sort est plus difficile à briser ou forcer ; le DD pour le briser ou tenter de le crocheter augmente de 10.<br>"
	},
	{
		name: "Vision dans le noir",
		originalName: "Darkvision",
		castedBy: [
			"artificer",
			"druid",
			"ranger",
			"sorcerer",
			"wizard"
		],
		id: "97d4f969-bb4b-42be-846a-6ae70b56164a",
		level: 2,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (soit une pincée de carotte séchée, soit une agate)",
		duration: "8 heures",
		description: "Vous touchez une créature consentante pour lui conférer la capacité de voir dans le noir. Pour la durée du sort, cette créature obtient la vision dans le noir (portée 18 mètres).<br>"
	},
	{
		name: "Voir l'invisible",
		originalName: "See Invisibility Détection de l'invisibilité",
		castedBy: [
			"artificer",
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "1b4531fd-e267-49a7-8d64-62aa0d5a5264",
		level: 2,
		school: "divination",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (une pincée de talc et une petite quantité de poudre d'argent)",
		duration: "1 heure",
		description: "Pour la durée du sort, vous percevez les créatures et objets invisibles comme s'ils étaient visibles, et vous pouvez voir dans le plan éthéré. Les objets et créatures éthérées apparaissent fantomatiques et translucides.<br>"
	},
	{
		name: "Vol",
		originalName: "Fly",
		castedBy: [
			"artificer",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "67b2a0ee-da77-4b4d-be81-ef0a3f831d68",
		level: 3,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (une plume d'aile d'oiseau)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous touchez une créature consentante. La cible obtient une vitesse de vol de 18 mètres pour la durée du sort. Lorsque le sort prend fin, la cible tombe si elle est toujours dans les airs, sauf si elle peut empêcher la chute.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, vous pouvez cibler une créature additionnelle pour chaque niveau d'emplacement au-delà du niveau 3.<br>"
	},
	{
		name: "Amis",
		originalName: "Friends Faux amis",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "6dc31fcf-04d9-4947-ad8e-24df3acbc54f",
		level: 0,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "S, M (une petite quantité de maquillage appliquée sur le visage durant l'incantation)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Pour la durée du sort, vous avez un avantage à tous vos jets de Charisme effectués contre une créature de votre choix qui n'a pas une attitude hostile envers vous. Lorsque le sort prend fin, la créature réalise que vous avez utilisé la magie pour l'influencer et devient hostile à votre égard. Une créature plutôt violente risque de vous attaquer. D'autres créatures peuvent vous demander de l'argent ou un service (à la discrétion du MD), cela dépend de la nature de l'échange que vous avez eu avec la créature.<br>"
	},
	{
		name: "Amitié avec les animaux",
		originalName: "Animal Friendship",
		castedBy: [
			"bard",
			"druid",
			"ranger"
		],
		id: "c03d49fe-fecc-4936-9e1e-37cb197a2c28",
		level: 1,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (un morceau de nourriture)",
		duration: "24 heures",
		description: "Ce sort vous permet de persuader une bête que vous ne lui voulez aucun mal. Choisissez une bête que vous pouvez voir dans la portée du sort. Elle doit vous voir et vous entendre. Si l'Intelligence de la bête est de 4 ou plus, le sort échoue. Autrement, la bête doit réussir un jet de sauvegarde de Sagesse ou être charmée pour la durée du sort. Si vous, ou un de vos compagnons, blessez la cible, le sort prend fin.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, vous pouvez charmer une bête supplémentaire pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Antidétection",
		originalName: "Nondetection",
		castedBy: [
			"bard",
			"ranger",
			"wizard"
		],
		id: "85c30447-6fc9-4eb6-a71e-af745de28af8",
		level: 3,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (une pincée de poudre de diamant d'une valeur de 25 po saupoudrée sur la cible, que le sort consomme)",
		duration: "8 heures",
		description: "Pour la durée du sort, vous cachez une cible que vous touchez de la divination magique. La cible peut être une créature consentante, un endroit ou un objet ne faisant pas plus de 3 mètres dans toutes les dimensions. La cible ne peut pas être ciblée par quelque divination magique que ce soit ou perçue grâce à des objets de détection magique.<br>"
	},
	{
		name: "Apaisement des émotions",
		originalName: "Calm Emotions",
		castedBy: [
			"bard",
			"cleric"
		],
		id: "a24541f3-8ade-4e9a-9b46-4aa42a36c5a2",
		level: 2,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous tentez de supprimer les émotions fortes dans un groupe de personnes. Chaque humanoïde dans une sphère de 6 mètres de rayon centrée sur un point choisi dans la portée du sort doit effectuer un jet de sauvegarde de Charisme. Une créature peut choisir de rater volontairement son jet de sauvegarde. En cas d'échec au jet de sauvegarde, choisissez l'un des deux effets suivants.<br>Vous pouvez supprimer tous les effets qui font qu'une cible est charmée ou effrayée. Lorsque ce sort prend fin, les effets supprimés reviennent, en présumant que leur durée n'a pas expiré entre temps.<br>Ou vous pouvez rendre une cible indifférente à des créatures envers qui elle montre des signes d'hostilité. Cette indifférence prend fin lorsque la cible est attaquée ou blessée par un sort ou lorsqu'elle est témoin d'une attaque envers un de ses alliés. Lorsque le sort prend fin, la créature redevient hostile, à moins que le MD en décide autrement.<br>"
	},
	{
		name: "Apparence trompeuse",
		originalName: "Seeming",
		castedBy: [
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "f432f6f1-6cdf-49bb-8920-207979b48253",
		level: 5,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S",
		duration: "8 heures",
		description: "Ce sort vous permet de changer l'apparence des créatures que vous pouvez voir dans la portée du sort. Vous donnez à chaque créature choisie une nouvelle apparence illusoire. Une cible réticente doit réussir un jet de sauvegarde de Charisme pour ne pas être affectée par le sort.<br>Le sort déguise l'apparence physique autant que les vêtements, l'armure, les armes et l'équipement. Vous pouvez faire paraître chaque créature 30 cm plus grande ou plus petite, mince, obèse, ou entre les deux. Vous ne pouvez pas modifier leur type morphologique. Vous devez donc choisir une forme qui présente un arrangement similaire des membres. Par ailleurs, l'ampleur de l'illusion ne tient qu'à vous. L'effet persiste pour la durée du sort, sauf si vous utilisez une action pour y mettre fin.<br>Les modifications apportées par ce sort ne résistent pas à une inspection physique. Par exemple, si vous utilisez ce sort pour ajouter un chapeau à votre accoutrement, les objets passeront à travers le chapeau et si on y touche, on ne sentira pas sa présence ou on tâtera plutôt votre tête et votre chevelure. Si vous utilisez ce sort pour paraître plus mince, la main d'une personne qui veut vous toucher entrera en contact avec votre corps alors que sa main semble libre d'obstruction.<br>Une créature peut utiliser son action pour inspecter une cible et elle doit réussir un jet d'Intelligence (Investigation) contre le DD de sauvegarde de votre sort. Si elle réussit, la créature comprend que la cible est déguisée.<br>"
	},
	{
		name: "Bagou",
		originalName: "Glibness",
		castedBy: [
			"bard",
			"warlock"
		],
		id: "f5f8671a-3750-4881-9bb8-45688741939f",
		level: 8,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V",
		duration: "1 heure",
		description: "Jusqu'à ce que le sort se termine, lorsque vous effectuez un jet de Charisme, vous pouvez remplacer le résultat du dé par un 15. De plus, peu importe vos propos, les magies qui permettent de savoir si vous dites la vérité ou non indiquent que ce que vous dites est vrai.<br>"
	},
	{
		name: "Cage de force",
		originalName: "Forcecage",
		castedBy: [
			"bard",
			"warlock",
			"wizard"
		],
		id: "75863b08-ea34-4393-b6a0-240127653a34",
		level: 7,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "30 mètres",
		components: "V, S, M (de la poussière de rubis valant au moins 1500 po)",
		duration: "1 heure",
		description: "Une prison en forme de cube immobile et invisible, composée de force magique, apparaît autour d'une zone que vous choisissez et à portée. La prison peut être une cage ou une boîte solide, selon votre choix.<br>Une prison prenant la forme d'une cage peut faire jusqu'à 6 mètres de côté et est constituée de barreaux de 1,25 cm de diamètre et espacés de 1,25 cm également.<br>Une prison prenant la forme d'une boîte peut faire jusqu'à 3 mètres de côté, créant une barrière solide qui empêche la matière de passer au travers et bloque les sorts lancés de l'intérieur vers l'extérieur de la zone, et vice versa.<br>Lorsque vous lancez ce sort, toute créature qui se trouve complètement dans la zone de la cage est piégée. Les créatures qui ne sont que partiellement dans la zone, ou celles qui sont trop larges pour tenir dans la prison, sont repoussées depuis le centre de la zone jusqu'à ce qu'elles en soient complètement sorties.<br>Une créature à l'intérieur de la cage ne peut pas la quitter par des moyens non magiques. Si la créature tente d'utiliser la téléportation ou le voyage planaire pour sortir de la cage, elle doit d'abords effectuer un jet de sauvegarde de Charisme. En cas de réussite, la créature peut utiliser cette magie pour sortir de la cage. En cas d'échec, la créature ne peut sortir de la cage et a dépensé cette utilisation de sort ou d'effet. La cage peut également s'étendre dans le plan éthéré pour bloquer les voyages éthérés.<br>Ce sort ne peut pas être dissipé avec le sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=dissipation-de-la-magie\">dissipation de la magie</a></em>.<br>"
	},
	{
		name: "Cécité/Surdité",
		originalName: "Blindness/Deafness",
		castedBy: [
			"bard",
			"cleric",
			"sorcerer",
			"wizard"
		],
		id: "5b82b330-98ff-43f4-9bfb-4aa9b7c76a80",
		level: 2,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V",
		duration: "1 minute",
		description: "Vous pouvez aveugler ou assourdir un ennemi. Choisissez une créature que vous pouvez voir dans la portée du sort. Celle-ci doit réussir un jet de sauvegarde de Constitution sans quoi elle est soit aveuglée, soit assourdie (selon votre choix) pour la durée du sort. À la fin de chacun de ses tours, la cible effectue un jet de sauvegarde de Constitution. En cas de réussite, le sort prend fin.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Cercle de téléportation",
		originalName: "Teleportation Circle",
		castedBy: [
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "f8017e9a-e765-4eb1-a071-628ec130a64e",
		level: 5,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 minute",
		range: "3 mètres",
		components: "V, M (des craies et encres rares imprégnées de pierres précieuses d'une valeur d'au moins 50 po, que le sort consomme)",
		duration: "1 round",
		description: "Pendant que vous incantez le sort, vous dessinez sur le sol un cercle de 3 mètres de diamètre constitué de symboles qui lient votre position à un cercle de téléportation permanent de votre choix dont vous connaissez la séquence des symboles et qui se trouve sur le même plan d'existence que vous. Un portail scintillant s'ouvre dans le cercle que vous avez dessiné et reste ouvert jusqu'à la fin de votre prochain tour. Toute créature qui entre dans le portail apparaît instantanément à 1,50 mètre du portail de destination ou dans l'espace inoccupé le plus proche si cet espace est déjà pris.<br>Nombre de grands temples, guildes et autres endroits importants ont installé des portails de téléportation permanents quelque part dans leur enceinte. Chacun de ces cercles de téléportation permanent a sa propre et unique séquence de symboles ; une chaîne de runes magiques arrangées d'une manière particulière. Lorsque vous gagnez pour la première fois la possibilité de lancer ce sort, vous apprenez les séquences de symboles pour deux destinations du plan matériel, déterminées par le MD. Vous pouvez apprendre de nouvelles séquences au cours de vos aventures. Vous pouvez mémoriser une nouvelle séquence de symboles après l'avoir étudiée pendant 1 minute.<br>Vous pouvez créer un cercle de téléportation permanent en lançant ce sort au même endroit, tous les jours pendant 1 an. Vous n'êtes pas obligé de traverser le cercle de téléportation lorsque vous lancez ce sort pour créer un cercle de téléportation permanent.<br>"
	},
	{
		name: "Charme-monstre",
		originalName: "Charm Monster",
		castedBy: [
			"bard",
			"druid",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "e34662ca-b63a-41ff-bcf3-cc6a74c04adf",
		level: 4,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S",
		duration: "1 heure",
		description: "Vous essayez de charmer une créature que vous pouvez voir à portée. Celle-ci doit effectuer un jet de sauvegarde de Sagesse, avec un avantage si vous ou vos compagnons la combattez. En cas d'échec, vous la charmez jusqu'à la fin du sort ou jusqu'à ce que vous ou vos compagnons lui fassiez quelque chose de nuisible. La créature charmée est amicale avec vous. Lorsque le sort prend fin, la créature sait que vous l'avez charmée.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 5 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d'emplacement au-delà du niveau 4. Les créatures doivent être à 9 mètres ou moins les unes des autres lorsque vous les ciblez.<br>"
	},
	{
		name: "Charme-personne",
		originalName: "Charm Person",
		castedBy: [
			"bard",
			"druid",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "0b81de01-365b-4b44-9913-ed3d07ba3b13",
		level: 1,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S",
		duration: "1 heure",
		description: "Vous pouvez tenter de charmer un humanoïde que vous pouvez voir à portée. Ce dernier doit effectuer un jet de sauvegarde de Sagesse, avec un avantage à son jet si vous ou vos compagnons le combattez. En cas d'échec, il est charmé jusqu'à la fin de la durée du sort ou jusqu'à ce que vous ou vos compagnons cherchiez à lui nuire. La créature charmée vous considère comme un bon ami. Quand le sort prend fin, la créature sait que vous l'avez charmée.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d'emplacement au-delà du niveau 1. Les créatures doivent se trouver à 9 mètres maximum les unes des autres lorsque vous les ciblez.<br>"
	},
	{
		name: "Clairvoyance",
		originalName: "Clairvoyance",
		castedBy: [
			"bard",
			"cleric",
			"sorcerer",
			"wizard"
		],
		id: "dc6a0d7c-6ed8-40b5-9f96-60f34e640abb",
		level: 3,
		school: "divination",
		isRitual: false,
		castingTime: "10 minutes",
		range: "1,5 kilomètre",
		components: "V, S, M (un focaliseur d'une valeur d'au moins 100 po, soit une corne pour entendre enchâssée de gemme, soit un œil de verre pour voir)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous créez un détecteur invisible, à portée, dans une zone qui vous est familière (un endroit que vous avez visité ou déjà vu) ou dans une zone évidente qui ne vous est pas familière (comme l'autre côté d'une porte, derrière un angle ou dans un bosquet). Le détecteur reste en place pour la durée du sort, il ne peut pas être attaqué ou être en interaction avec quoi que ce soit.<br>Lorsque vous lancez le sort, vous choisissez de voir ou d'entendre. Vous pouvez utiliser le sens choisi au travers du détecteur comme si vous étiez à sa place. En utilisant votre action, vous pouvez alterner entre vu et audition via le détecteur.<br>Une créature qui peut voir le détecteur (comme une créature bénéficiant du sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=voir-l-invisible\">voir l'invisible</a></em> ou de vision véritable) voit un orbe lumineux et intangible de la taille de votre poing.<br>"
	},
	{
		name: "Communication à distance",
		originalName: "Sending",
		castedBy: [
			"bard",
			"cleric",
			"wizard"
		],
		id: "1cac829c-ab25-49e2-acd8-5e6ba98794e9",
		level: 3,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "illimitée",
		components: "V, S, M (un petit morceau de fil de cuivre)",
		duration: "1 round",
		description: "Vous faites parvenir un court message de 25 mots ou moins à une créature avec laquelle vous êtes familier. La créature entend le message dans son esprit. Elle vous reconnaît en tant qu'émetteur si elle vous connaît. Et elle peut répondre immédiatement, de la même manière. Le sort permet aux créatures ayant au moins 1 en Intelligence de comprendre le sens du message.<br>Vous pouvez envoyer le message sans égard à la distance, voire sur d'autres plans d'existence. Si la cible est sur un plan différent du vôtre, le message a 5 % de chance de ne pas arriver au destinataire.<br>"
	},
	{
		name: "Communication avec les animaux",
		originalName: "Speak with Animals",
		castedBy: [
			"bard",
			"druid",
			"ranger"
		],
		id: "1a874d12-8d84-4976-bb8b-06e9dcdfb36f",
		level: 1,
		school: "divination",
		isRitual: true,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "10 minutes",
		description: "Vous gagnez la capacité de comprendre et de communiquer verbalement (ou oralement) avec des bêtes pour la durée du sort. Les connaissances et la compréhension de nombreuses bêtes sont limitées par leur intelligence, mais au minimum, elles peuvent vous communiquer des informations sur les alentours et les bêtes à proximité, incluant tout ce qu'elles peuvent percevoir ou ont perçu au cours des derniers jours. Vous devriez être capable de convaincre une bête de vous rendre un petit service, à la discrétion du MD.<br>"
	},
	{
		name: "Communication avec les morts",
		originalName: "Speak with Dead",
		castedBy: [
			"bard",
			"cleric"
		],
		id: "3ab85f46-8d6e-4f66-884f-3b9c9732d304",
		level: 3,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "3 mètres",
		components: "V, S, M (de l'encens qui brûle)",
		duration: "10 minutes",
		description: "Vous accordez un semblant de vie et d'intelligence à un cadavre de votre choix dans la portée du sort, ce qui lui permet de répondre aux questions que vous lui posez. Le cadavre doit encore avoir une bouche et ne peut pas être un mort-vivant. Le sort échoue si le cadavre a été la cible de ce sort durant les 10 derniers jours.<br>Jusqu'à ce que le sort se termine, vous pouvez poser cinq questions au cadavre. Le cadavre ne connaît que ce qu'il savait durant son vivant, y compris les langues. Les réponses sont généralement brèves, énigmatiques ou répétitives, et le cadavre n'est pas obligé de donner une réponse honnête si vous lui êtes hostile ou s'il vous reconnaît comme étant un ennemi. Ce sort ne permet pas le retour de l'âme de la créature à son corps ; il ne fait qu'animer son esprit. Ainsi, le défunt ne peut pas apprendre de nouvelles informations, ne comprend pas tout ce qui s'est passé depuis son trépas et ne peut pas spéculer sur les événements futurs.<br>"
	},
	{
		name: "Communication avec les plantes",
		originalName: "Speak with Plants",
		castedBy: [
			"bard",
			"druid",
			"ranger"
		],
		id: "cce3fe44-cc09-4356-a7bf-1a07b0551d1f",
		level: 3,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (rayon de 9 mètres)",
		components: "V, S",
		duration: "10 minutes",
		description: "Vous procurez aux plantes dans un rayon de 9 mètres autour de vous une sensibilité et une animation limitée, leur donnant la capacité de communiquer avec vous et suivre vos ordres simples. Vous pouvez interroger les plantes sur des événements récents qui se sont déroulés dans la zone du sort et récupérer ainsi des informations concernant les créatures qui sont passées par là, les conditions météorologiques ou d'autres situations.<br>Vous pouvez également transformer un terrain difficile, causé par la croissance des plantes (comme des taillis ou des sous-bois), en un terrain ordinaire pour la durée du sort. Ou vous pouvez transformer un terrain ordinaire où des plantes sont présentes, en terrain difficile pour la durée du sort, créant des plantes rampantes ou des branches afin d'entraver des poursuivants, par exemple.<br>Les plantes devraient pouvoir réaliser d'autres tâches pour vous, à la discrétion du MD. Le sort ne permet pas aux plantes de se déraciner pour se déplacer, mais elles peuvent bouger librement leurs branches, vrilles et tiges.<br>Si une créature végétale se situe dans la zone, vous pouvez communiquer avec elle, comme si vous parliez un langage commun, mais vous ne gagnez aucune capacité magique pour l'influencer.<br>Ce sort peut obliger les plantes créées par le sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=enchevetrement\">enchevêtrement</a></em> à relâcher une créature entravée.<br>"
	},
	{
		name: "Compréhension des langues",
		originalName: "Comprehend Languages",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "1105e49e-ef00-4d53-8bd2-0cd2fc52bb04",
		level: 1,
		school: "divination",
		isRitual: true,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (une pincée de suie et de sel)",
		duration: "1 heure",
		description: "Pendant la durée du sort, vous comprenez la signification littérale de toute langue parlée que vous pouvez entendre. Vous comprenez également tout langage écrit que vous pouvez voir, mais vous devez toucher la surface sur laquelle les mots sont inscrits. Il faut une minute pour lire une page de texte.<br>Ce sort ne décode pas les messages secrets dans un texte ou un glyphe, tel qu'un symbole magique, qui ne fait pas partie du langage écrit.<br>"
	},
	{
		name: "Compulsion",
		originalName: "Compulsion",
		castedBy: [
			"bard"
		],
		id: "c7480815-16f2-4690-9d67-6d39873e1f34",
		level: 4,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Les créatures de votre choix, à portée, que vous pouvez voir et qui peuvent vous entendre, doivent effectuer un jet de sauvegarde de Sagesse. Une cible réussit automatiquement son jet de sauvegarde si elle ne peut pas être charmée. En cas d'échec, une cible est affectée par ce sort. Jusqu'à la fin du sort, vous pouvez utiliser votre action bonus à chacun de vos tours pour désigner une direction horizontale. Chaque cible affectée doit utiliser tout son mouvement possible pour se déplacer dans cette direction lors de son prochain tour. Elle peut effectuer son action avant d'utiliser son mouvement. Après s'être déplacée de la sorte, elle peut effectuer un autre jet de sauvegarde de Sagesse pour tenter de mettre fin à l'effet.<br>Une cible n'est pas contrainte de se déplacer dans une direction si celle-ci est manifestement mortelle, comme un feu ou un gouffre, mais elle provoquera des attaques d'opportunité en se déplaçant dans la direction désignée.<br>"
	},
	{
		name: "Confusion",
		originalName: "Confusion",
		castedBy: [
			"bard",
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "d7554c25-db2a-40ab-8289-6add4b252faa",
		level: 4,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (trois coquilles de noix)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Ce sort assaille et tord les esprits des créatures, générant des illusions et provoquant des actions incontrôlées. Chaque créature dans une sphère de 3 mètres de rayon centrée sur un point choisi dans la portée du sort doit réussir un jet de sauvegarde de Sagesse, sans quoi elle sera affectée par le sort.<br>Une cible affectée ne peut réagir et elle doit lancer 1d10 au début de chacun de ses tours pour déterminer son comportement pour ce tour.<br><table><tbody><tr><th class=\"center\">d10</th><th>Comportement</th></tr><tr><td class=\"center\">1</td><td>La créature emploie tout son mouvement pour se déplacer de façon aléatoire. Pour déterminer la direction, lancez 1d8 et assignez une direction à chaque face. La créature ne prend pas d'action pour ce tour.</td></tr><tr><td class=\"center\">2-6</td><td>La créature ne se déplace pas et elle ne prend pas d'action pour ce tour.</td></tr><tr><td class=\"center\">7-8</td><td>La créature prend son action pour faire une attaque au corps à corps contre une créature à sa portée, déterminée de façon aléatoire. Si aucune créature n'est à sa portée, la créature ne fait rien pour ce tour.</td></tr><tr><td class=\"center\">9-10</td><td>La créature peut agir et se déplacer normalement.</td></tr></tbody></table><br>À la fin de chacun de ses tours, une créature affectée peut faire un jet de sauvegarde de Sagesse. En cas de réussite, l'effet du sort prend fin pour cette cible.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 5 ou supérieur, le rayon de la sphère augmente de 1,50 mètre pour chaque niveau d'emplacement au-delà du niveau 4.<br>"
	},
	{
		name: "Contrat",
		originalName: "Planar Binding Entrave planaire",
		castedBy: [
			"bard",
			"cleric",
			"druid",
			"wizard"
		],
		id: "d72181a4-8634-4106-85c7-11c0d322abc5",
		level: 5,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 heure",
		range: "18 mètres",
		components: "V, S, M (un bijou valant au minimum 1 000 po, que le sort consomme)",
		duration: "24 heures",
		description: "Avec ce sort, vous tentez de vous attacher les services d'un céleste, d'un élémentaire, d'une fée ou d'un fiélon. La créature doit être à portée pendant toute la durée de l'incantation (typiquement, la créature est tout d'abord invoquée à l'intérieur d'un sort de cercle magique inversé, pour qu'elle ne puisse pas s'échapper, tandis que vous lancez ce sort). À la fin de l'incantation, la cible doit effectuer un jet de sauvegarde de Charisme. En cas d'échec, elle est tenue de vous servir pour toute la durée du sort. Si la créature a été invoquée ou a été créée par un autre sort, la durée du sort est étendue pour correspondre à celle du sort <em>contrat</em>.<br>Une créature liée doit suivre vos instructions au mieux de ses capacités. Vous pouvez ordonner à la créature de vous accompagner lors de vos aventures, de garder un lieu, ou de délivrer un message. La créature obéit à la lettre à vos instructions, mais si la créature vous est hostile, elle interprétera vos ordres afin d'accomplir ses propres objectifs. Si la créature exécute complètement les instructions qu'elle a reçues avant que le sort ne prenne fin, elle voyage jusqu'à vous pour vous en informer si vous vous trouvez tous deux dans le même plan d'existence. Si vous êtes dans des plans d'existence différents, elle retourne à l'endroit où vous l'avez asservie et y reste jusqu'à ce que le sort prenne fin.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau supérieur, la durée du sort passe à 10 jours avec un emplacement de niveau 6, à 30 jours pour un niveau 7, à 180 jours pour un niveau 8, et elle passe à 1 an et 1 jour en utilisant un emplacement de niveau 9.<br>"
	},
	{
		name: "Coup au but",
		originalName: "True Strike",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "b058c0a6-bec0-43c3-a3ff-ee4aca87b94d",
		level: 0,
		school: "divination",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "S",
		duration: "concentration, jusqu'à 1 round",
		description: "Vous tendez votre main et pointez un doigt en direction d'une cible à portée. Votre magie vous aide à trouver une petite faille dans les défenses de votre cible. Lors de votre prochain tour, vous obtenez un avantage pour votre premier jet d'attaque contre la cible, à condition que le sort ne soit pas déjà terminé.<br>"
	},
	{
		name: "Couronne du dément",
		originalName: "Crown of Madness",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "6cefbb3f-2eac-43e8-aee5-d2feef85c6ba",
		level: 2,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Un humanoïde de votre choix, que vous pouvez voir et à portée, doit réussir un jet de sauvegarde de Sagesse ou être charmé pour la durée du sort. Tant que vous charmez la cible par ce sort, une couronne entortillée de morceaux de fer déchiquetés apparaît sur sa tête, et la folie envahit son regard.<br>La cible charmée doit utiliser son action avant de se déplacer, à chacun de ses tours, pour effectuer une attaque au corps à corps contre une créature autre qu'elle-même et que vous avez mentalement choisie.<br>La cible peut agir normalement au cours de son tour si vous ne choisissez aucune créature ou s'il n'y en a aucune à portée.<br>Lors de vos tours suivants, vous devez utiliser votre action pour maintenir le contrôle sur votre cible, sans quoi le sort prend fin. La cible peut également effectuer un jet de sauvegarde de Sagesse à la fin de chacun de ses tours. Si elle le réussit, le sort prend fin.<br>"
	},
	{
		name: "Croissance végétale",
		originalName: "Plant Growth",
		castedBy: [
			"bard",
			"druid",
			"ranger"
		],
		id: "1178ca4d-a72d-407a-86aa-c5675edad2fd",
		level: 3,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action ou 8 heures",
		range: "45 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Ce sort canalise une force vitale vers les plantes présentes dans une zone spécifique. Il y a deux usages possibles du sort. L'un procure des bénéfices immédiats alors que l'autre s'étale sur un plus long terme.<br>Si vous lancez ce sort en utilisant 1 action, choisissez un point dans la portée du sort. Toutes plantes normales présentes dans un rayon de 30 mètres autour de ce point croissent avec vigueur. Une créature se déplaçant à travers la zone doit consommer 4 mètres de mouvement pour parcourir 1 mètre.<br>Vous pouvez désigner une ou plusieurs zones de dimension variable comme étant exclues de la zone d'effet du sort.<br>Si vous lancez ce sort sur une période de 8 heures, vous enrichissez le sol. Toutes les plantes présentes dans une surface de 400 mètres de rayon centrée sur point dans la portée du sort sont enrichies pour 1 année. Les plantes produisent deux fois plus de nourriture lors de la récolte.<br>"
	},
	{
		name: "Danse irrésistible d'Otto",
		originalName: "Otto's Irresistible Dance",
		castedBy: [
			"bard",
			"wizard"
		],
		id: "097a3f70-8b86-4c39-94c6-8760cf6ee0c5",
		level: 6,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "Choisissez une créature visible et à portée. La cible entame une danse hilarante et maladroite, tapant des pieds et applaudissant pendant la durée du sort. Les créatures ne pouvant être charmées sont immunisées à ce sort.<br>La victime doit utiliser tout son mouvement pour danser tout en restant à la même place et à un désavantage à ses jets de sauvegarde de Dextérité et ses jets d'attaque. Les autres créatures ont un avantage à leur jet d'attaque contre la victime. Par une action, la victime peut tenter un jet de sauvegarde de Sagesse afin de regagner le contrôle d'elle-même. Sur un jet réussi, le sort prend fin.<br>"
	},
	{
		name: "Déblocage",
		originalName: "Knock",
		castedBy: [
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "1953b34f-989b-4978-ba92-4465c22f367a",
		level: 2,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V",
		duration: "instantanée",
		description: "Choisissez un objet que vous pouvez voir dans la portée du sort. L'objet peut être une porte, une boîte, un coffre, des menottes, un cadenas, ou un autre objet qui contient des dispositifs conventionnels ou magiques qui empêchent l'accès.<br>Un objet cible qui est maintenu fermé par un verrou normal, ou qui est bloqué ou barré, devient déverrouillé ou débloqué. Si l'objet possède plusieurs verrous, seulement l'un d'entre eux est déverrouillé.<br>Si vous choisissez un objet cible qui est tenu fermé par un sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=verrou-magique\">verrou magique</a></em>, ce sort est supprimé pendant 10 minutes, au cours desquelles l'objet cible peut être ouvert et fermé normalement. Quand vous lancez le sort, un coup fort et audible jusqu'à 90 mètres émane de l'objet cible.<br>"
	},
	{
		name: "Détection des pensées",
		originalName: "Detect Thoughts",
		castedBy: [
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "a81eef4b-c32d-4d9c-93cf-5223f1ea3ec2",
		level: 2,
		school: "divination",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (une pièce de cuivre)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Pour la durée du sort, vous pouvez lire les pensées de certaines créatures. Lorsque vous incantez le sort et lors de votre action à chaque tour jusqu'à la fin du sort, vous pouvez concentrer votre esprit sur une créature que vous pouvez voir à 9 mètres ou moins de vous. Si la créature choisie possède une Intelligence de 3 ou moins, ou si elle ne parle aucun langage, la créature n'est pas affectée.<br>Vous lisez d'abord les pensées superficielles de la créature, ce qui occupe son esprit à cet instant. Lors d'une action, vous pouvez diriger votre attention sur les pensées d'une autre créature ou tenter d'approfondir votre lecture des pensées de la même créature. Si vous approfondissez votre lecture, la cible doit effectuer un jet de sauvegarde de Sagesse. En cas d'échec, vous obtenez l'accès à son raisonnement (le cas échéant), à son état émotif et à une pensée qui préoccupe son esprit sur un spectre plus large tel un souci, un amour ou une haine. En cas de réussite, le sort prend fin. Dans tous les cas, la cible est consciente que son esprit est sous votre regard. À moins que vous ne dirigiez votre attention sur les pensées d'une autre créature, la cible peut utiliser son action à son tour pour faire un jet d'Intelligence contre votre jet d'Intelligence. Si elle gagne l'opposition, le sort prend fin.<br>Les questions dirigées verbalement vers la cible orientent le fil de ses pensées. Ce sort est donc particulièrement efficace lors d'un interrogatoire.<br>Vous pouvez aussi employer ce sort pour détecter la présence de créatures pensantes qui vous sont invisibles. Lorsque vous lancez ce sort ou lors d'une action pendant la durée du sort, vous pouvez chercher des pensées à 9 mètres ou moins de vous. Le sort peut outrepasser la plupart des obstacles mais il est bloqué par 60 cm de pierre, 5 cm de métal ordinaire, ou une mince feuille de plomb. Vous ne pouvez pas détecter une créature possédant une Intelligence de 3 ou moins ou ne parlant aucun langage.<br>Après avoir détecté la présence d'une créature de cette manière, vous pouvez lire ses pensées pour le reste de la durée du sort tel que décrit ci-dessus, même si vous ne pouvez plus la voir, mais à condition qu'elle reste dans la portée du sort.<br>"
	},
	{
		name: "Discours captivant",
		originalName: "Enthrall",
		castedBy: [
			"bard",
			"warlock"
		],
		id: "8ee1083e-0ed1-4d74-aa04-e32a464989eb",
		level: 2,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "1 minute",
		description: "Vous entrelacez des phrases distrayantes, ce qui force les créatures de votre choix, que vous pouvez voir et qui peuvent vous entendre, à effectuer un jet de sauvegarde de Sagesse. Toute créature qui ne peut pas être charmée réussit automatiquement son jet de sauvegarde, et si vous ou vos compagnons combattez une créature, celle-ci a un avantage à son jet de sauvegarde. Si une cible échoue son jet de sauvegarde, elle se voit affligée d'un désavantage à ses jets de Sagesse (Perception) effectués pour repérer une autre créature que vous, et ce jusqu'à ce que le sort prenne fin ou jusqu'à ce qu'elle ne puisse plus vous entendre. Ce sort prend fin si vous êtes incapable d'agir ou ne pouvez plus parler.<br>"
	},
	{
		name: "Domination de monstre",
		originalName: "Dominate Monster",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "6904f584-e435-468c-91b1-aba69b2236fd",
		level: 8,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous tentez de subjuguer une créature à portée que vous pouvez voir. Elle doit réussir un jet de sauvegarde de Sagesse ou être charmée pour la durée du sort. Si vous ou des créatures qui vous sont amies la combattez, elle bénéficie d'un avantage à son jet de sauvegarde.<br>Tant que la créature est charmée, vous établissez un contact télépathique avec elle aussi longtemps que vous vous trouvez tous les deux sur le même plan d'existence. Vous pouvez utiliser ce lien télépathique pour donner des ordres à la créature tant que vous êtes conscient (aucune action n'est requise). La créature fait tout ce qui est en son pouvoir pour obéir. Vous pouvez préciser un type d'action à la fois simple et général, comme « Attaque cette créature », « Cours jusque-là » ou « Rapporte cet objet ». Si la créature exécute la demande et ne reçoit pas d'autres indications de votre part, elle se défend au mieux de sa capacité.<br>Vous pouvez utiliser une action pour obtenir le contrôle total et précis de la cible. Jusqu'à la fin de votre prochain tour, la créature agit seulement selon vos choix et elle ne peut rien faire sans que vous ne l'autorisiez. Pendant cette période, vous pouvez provoquer une réaction de la part de la créature, mais l'usage de cette réaction sera aussi le vôtre.<br>Chaque fois que la cible subit des dégâts, elle tente un nouveau jet de sauvegarde de Sagesse. Si elle réussit, le sort prend fin.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 9, la durée du sort sous concentration augmente jusqu'à 8 heures.<br>"
	},
	{
		name: "Domination de personne",
		originalName: "Dominate Person",
		castedBy: [
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "680b66ee-e95e-433d-9d4f-028a2d8bc71f",
		level: 5,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous tentez de subjuguer un humanoïde à portée que vous pouvez voir. Celui-ci doit réussir un jet de sauvegarde de Sagesse ou être charmé pour la durée du sort. Si vous ou des créatures qui vous sont amies le combattez, il bénéficie d'un avantage à son jet de sauvegarde.<br>Tant que la cible est charmée, vous établissez un contact télépathique avec elle aussi longtemps que vous vous trouvez tous les deux sur le même plan d'existence. Vous pouvez utiliser ce lien télépathique pour donner des ordres à la créature, tant que vous êtes conscient (aucune action n'est requise). La créature fait tout ce qui est en son pouvoir pour obéir. Vous pouvez préciser un type d'action à la fois simple et général, comme « Attaque cette créature », « Cours jusque-là » ou « Rapporte cet objet ». Si la créature exécute la demande et ne reçoit pas d'autres indications de votre part, elle se défend au mieux de sa capacité.<br>Vous pouvez utiliser une action pour obtenir le contrôle total et précis de la cible. Jusqu'à la fin de votre prochain tour, la créature agit seulement selon vos choix et elle ne peut rien faire sans que vous ne l'autorisiez. Pendant cette période, vous pouvez provoquer une réaction de la part de la créature, mais l'usage de cette réaction sera aussi le vôtre.<br>Chaque fois que la cible subit des dégâts, elle tente un nouveau jet de sauvegarde de Sagesse. Si elle réussit, le sort prend fin.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 6, la durée du sort sous concentration augmente jusqu'à 10 minutes. Avec un emplacement de sort de niveau 7, la durée du sort sous concentration augmente jusqu'à 1 heure. Avec un emplacement de sort de niveau 8 ou supérieur, la durée du sort sous concentration augmente jusqu'à 8 heures.<br>"
	},
	{
		name: "Don des langues",
		originalName: "Tongues",
		castedBy: [
			"bard",
			"cleric",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "5f0a0466-040a-4005-b0cc-e9a3ef77a72b",
		level: 3,
		school: "divination",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, M (une petite pyramide à degrés en argile)",
		duration: "1 heure",
		description: "Ce sort confère à la créature que vous touchez la capacité de comprendre toutes les langues parlées qu'elle entend. De plus, lorsque la cible parle, toutes les créatures qui connaissent au moins un langage, et peuvent l'entendre, comprennent ce qu'elle dit.<br>"
	},
	{
		name: "Double illusoire",
		originalName: "Mislead",
		castedBy: [
			"bard",
			"wizard"
		],
		id: "b6a194e8-ddd3-4e01-af52-caaae564e932",
		level: 5,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous devenez invisible au moment même où un double illusoire apparaît à l'endroit où vous êtes. Le double persiste pour la durée du sort, mais l'invisibilité prend fin si vous attaquez ou si vous incantez un sort.<br>Vous pouvez utiliser une action pour déplacer votre double illusoire jusqu'à deux fois votre vitesse tout en le faisant gesticuler, parler et agir comme vous l'entendez.<br>Vous pouvez voir à travers ses yeux et entendre par ses oreilles comme si vous étiez là où il est. À chacun de vos tours, par une action bonus, vous pouvez retrouver vos sens et inversement. Tant que vous utilisez ses sens, vous êtes aveugle et sourd à votre environnement immédiat.<br>"
	},
	{
		name: "Ennemis à foison",
		originalName: "Enemies Abound",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "0e2b2283-1cc7-4ce4-9b1a-2a1989dcf182",
		level: 3,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous atteignez l'esprit d'une créature que vous pouvez voir et la forcez à effectuer un jet de sauvegarde d'Intelligence. Une créature réussit automatiquement si elle est immunisée contre la condition effrayé. En cas d'échec à la sauvegarde, la cible perd la capacité de distinguer un ami d'un ennemi, considérant toutes les créatures qu'elle peut voir comme des ennemis jusqu'à la fin du sort. Chaque fois que la cible subit des dégâts, elle peut répéter le jet de sauvegarde, mettant fin à l'effet sur elle-même en cas de réussite.<br>À chaque fois que la créature affectée choisit une autre créature comme cible, elle doit choisir la cible au hasard parmi les créatures qu'elle peut voir à portée de l'attaque, du sort ou de toute autre capacité qu'elle utilise. Si un ennemi provoque une attaque d'opportunité de la part de la créature affectée, la créature doit effectuer cette attaque si elle en est capable.<br>"
	},
	{
		name: "Épée de Mordenkainen",
		originalName: "Mordenkainen's Sword",
		castedBy: [
			"bard",
			"wizard"
		],
		id: "bf0d2c78-5eb3-48d3-ba06-deb6df539aef",
		level: 7,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (une épée miniature en platine avec un manche et un pommeau en cuivre et en zinc, valant au moins 250 po)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous créez un plan de force en forme d'épée qui flotte dans l'air, dans la portée et pour la durée du sort.<br>Lorsque l'épée fait son apparition, vous faites une attaque au corps à corps avec un sort contre une cible de votre choix à 1,50 mètre ou moins de l'épée. Si elle touche, la cible reçoit 3d10 dégâts de force. Jusqu'à la fin du sort, vous pouvez utiliser une action bonus à chacun de vos tours pour déplacer l'épée jusqu'à 6 mètres vers un endroit que vous voyez et répéter cette attaque contre la même cible ou une autre.<br>"
	},
	{
		name: "Esprit faible",
		originalName: "Feeblemind",
		castedBy: [
			"bard",
			"druid",
			"warlock",
			"wizard"
		],
		id: "fb28d407-4b6d-4ad7-957e-e19b2482a09f",
		level: 8,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "45 mètres",
		components: "V, S, M (une poignée de sphères en argile, verre, cristal ou minéral)",
		duration: "instantanée",
		description: "Vous anéantissez l'esprit d'une créature que vous pouvez voir et à portée, tentant ainsi de briser son intellect et sa personnalité. La cible subit 4d6 dégâts psychiques et doit effectuer un jet de sauvegarde d'Intelligence.<br>En cas d'échec, les valeurs de Charisme et d'Intelligence de la créature passent à 1. La créature ne peut plus lancer des sorts, activer un objet magique, comprendre un langage ou communiquer de manière intelligible. La créature peut cependant identifier ses amis, les suivre, et même les protéger.<br>À la fin de chaque période de 30 jours qui passe, la créature peut tenter un nouveau jet de sauvegarde contre ce sort. S'il le réussit, le sort prend fin.<br>Ce sort peut également être dissipé grâce à un sort de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=restauration-superieure\">restauration supérieure</a>, <a href=\"https://www.aidedd.org/dnd/sorts.php?vf=guerison\">guérison</a></em> ou <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=souhait\">souhait</a></em>.<br>"
	},
	{
		name: "Esprit impénétrable",
		originalName: "Mind Blank",
		castedBy: [
			"bard",
			"wizard"
		],
		id: "075ae26a-a617-4d39-8896-31637360cacb",
		level: 8,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "24 heures",
		description: "Jusqu'à ce que le sort prenne fin, une créature consentante que vous touchez est immunisée contre les dégâts psychiques, tout effet qui permettrait de connaître ses émotions ou de lire ses pensées, les sorts de divination, et la condition charmé. Le sort déjoue même le sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=souhait\">souhait</a></em> et les sorts ou effets aux pouvoirs similaires utilisés pour affecter l'esprit de la cible ou obtenir des informations au sujet de la cible.<br>"
	},
	{
		name: "Éveil",
		originalName: "Awaken",
		castedBy: [
			"bard",
			"druid"
		],
		id: "c4283127-8a3f-4e19-be13-f25cb30e49ec",
		level: 5,
		school: "transmutation",
		isRitual: false,
		castingTime: "8 heures",
		range: "contact",
		components: "V, S, M (une agate d'une valeur d'au moins 1 000 po, que le sort consomme)",
		duration: "instantanée",
		description: "Après avoir passé le temps d'incantation à tracer des symboles magiques sur une pierre précieuse, vous touchez une bête ou une plante de taille TG ou inférieure. La cible doit avoir une valeur d'Intelligence inférieure ou égale à 3, ou bien ne pas avoir de valeur d'Intelligence du tout.<br>La cible obtient une valeur d'Intelligence égale à 10. La cible gagne également la capacité de parler une langue que vous connaissez. Si la cible est une plante, elle gagne la capacité de mouvoir ses branches, ses racines, ses sarments, ses lianes, et ainsi de suite, et gagne des sens similaires à ceux des humains. Votre MD choisit les caractéristiques appropriées à la plante que vous avez éveillée, comme l'<a href=\"https://www.aidedd.org/dnd/monstres.php?vf=arbre-eveille\">arbre éveillé</a> ou l'<a href=\"https://www.aidedd.org/dnd/monstres.php?vf=arbuste-eveille\">arbuste éveillé</a>.<br>Vous charmez la bête ou la plante éveillée pendant 30 jours ou jusqu'à ce que vous, ou vos compagnons, nuisiez à la cible. Lorsque le charme prend fin, la créature éveillée choisit si elle reste amicale envers vous, en fonction de la manière dont vous l'avez traité lorsqu'elle était charmée.<br>"
	},
	{
		name: "Fléau",
		originalName: "Bane Imprécation",
		castedBy: [
			"bard",
			"cleric"
		],
		id: "3bfb1f8b-6f4c-4ea4-960b-015788e7920d",
		level: 1,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (une goutte de sang)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Jusqu'à 3 créatures de votre choix, que vous pouvez voir et qui sont à portée, doivent effectuer un jet de sauvegarde de Charisme. Quand une cible qui a raté son jet de sauvegarde fait un jet d'attaque ou un autre jet de sauvegarde avant la fin du sort, elle doit lancer un d4 et soustraire le résultat à son jet d'attaque ou de sauvegarde.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Force fantasmagorique",
		originalName: "Phantasmal Force",
		castedBy: [
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "ca08dddb-e756-48ae-b9ab-c9370da003bb",
		level: 2,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (un morceau de toison)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous façonnez une illusion qui s'enracine dans l'esprit d'une créature que vous pouvez voir dans la portée du sort. La cible doit réussir un jet de sauvegarde d'Intelligence sans quoi elle percevra comme réel un objet, une créature ou tout autre phénomène visible de votre conception, pas plus grand qu'un cube de 3 mètres d'arête, et ce pour la durée du sort. Le sort n'a pas d'effet sur les morts-vivants et les artificiels.<br>Le fantasme inclut les sons, la température et d'autres stimuli qui ne sont évidents que pour la créature.<br>La cible peut utiliser son action pour examiner le fantasme avec un jet d'Intelligence (Investigation) contre le DD de sauvegarde de votre sort. En cas de réussite, la cible comprend que le fantasme n'est qu'une illusion et le sort prend fin.<br>Tant que la cible est sous l'effet du sort, elle considère le fantasme comme réel. La cible rationalise toute conséquence insensée lorsqu'elle interagit avec le fantasme. Par exemple, une cible qui tente de traverser un pont fantasmatique qui enjambe un gouffre tombe après avoir fait un pas sur le pont. Si la cible survit à la chute, elle croit toujours que le pont existe bien et trouve une explication logique à sa chute (on l'a poussé, elle a glissé, une rafale l'a fait basculer).<br>Une cible affectée est tellement persuadée de la réalité du fantasme que l'illusion peut même lui faire subir des dégâts. Un fantasme façonné à l'image d'une créature peut attaquer la cible. De la même manière, un fantasme apparaissant comme du feu, un bassin d'acide ou du magma peut brûler la cible. À chaque round, lors de votre tour, le fantasme peut infliger 1d6 dégâts psychiques à la cible si elle se trouve dans l'espace du fantasme ou à 1,50 mètre ou moins du fantasme, dans le cas où l'illusion est celle d'une créature ou un danger qui pourrait logiquement infliger des dégâts, comme une attaque. La cible perçoit les dégâts comme étant du type approprié à l'illusion.<br>"
	},
	{
		name: "Forme éthérée",
		originalName: "Etherealness",
		castedBy: [
			"bard",
			"cleric",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "9668d9f3-768e-4301-beda-e125eb7a3a64",
		level: 7,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "jusqu'à 8 heures",
		description: "Vous faites un pas dans la zone périphérique du plan éthéré, dans un secteur qui chevauche votre plan actuel. Vous demeurez dans la Limite éthérée pour la durée du sort ou jusqu'à ce que vous utilisiez une action pour dissiper le sort. Entre temps, vous pouvez vous déplacer dans toutes les directions. Si vous vous déplacez vers le haut ou vers le bas, chaque unité de distance compte double. Vous pouvez voir et entendre le plan d'où vous venez, mais tout vous parait gris et vous ne pouvez rien distinguer au-delà de 18 mètres.<br>En étant sur le plan éthéré, vous ne pouvez affecter et être affecté que par des créatures également sur ce plan. Les créatures qui n'y sont pas ne peuvent ni percevoir votre présence ni interagir avec vous, à moins qu'une aptitude spéciale ou magique les rende aptes à le faire.<br>Vous ignorez tout objet ou effet qui n'est pas sur le plan éthéré, vous permettant ainsi de vous déplacer à travers les objets que vous percevez sur le plan d'où vous êtes.<br>Lorsque le sort prend fin, vous retournez aussitôt sur votre plan d'origine, à l'endroit que vous occupez à ce moment-là. Si vous occupez le même espace qu'un objet solide ou celui d'une créature, vous êtes immédiatement déplacé vers l'espace libre le plus près que vous pouvez occuper. L'éviction vous fait subir des dégâts de force correspondant à 6 fois la distance parcourue en mètre.<br>Ce sort n'a pas d'effet si vous l'incantez alors que vous êtes sur le plan éthéré ou sur un plan qui ne lui est pas limitrophe, comme l'un des Plans Extérieurs.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 8 ou supérieur, vous pouvez cibler jusqu'à trois créatures consentantes (vous y compris) pour chaque niveau d'emplacement au-delà du niveau 7. Les créatures doivent être dans un rayon de 3 mètres autour de vous lorsque vous lancez le sort.<br>"
	},
	{
		name: "Fou rire de Tasha",
		originalName: "Tasha's Hideous Laughter",
		castedBy: [
			"bard",
			"wizard"
		],
		id: "d338b33d-a2d7-4298-b2ab-8496d1a6feb5",
		level: 1,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (de minuscules tartes et une plume qui est agitée dans les airs)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Une créature de votre choix, que vous pouvez voir et à portée, a l'impression que tout ce qu'elle perçoit est hilarant et lui provoque une intense crise de fou rire. La cible doit réussir un jet de sauvegarde de Sagesse sous peine de tomber à terre, et être incapable d'agir et de se relever pour toute la durée du sort. Une créature ayant une Intelligence de 4 ou moins ne peut pas être affectée par ce sort.<br>À la fin de chacun de ses tours, et à chaque fois qu'elle subit des dégâts, la cible peut effectuer un nouveau jet de sauvegarde de Sagesse. La cible a un avantage à son jet de sauvegarde s'il est déclenché par des dégâts. En cas de réussite, le sort prend fin.<br>"
	},
	{
		name: "Fracassement",
		originalName: "Shatter",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "b67bf129-a82f-4e4d-a4f7-c8c7f5a3a613",
		level: 2,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (un éclat de mica)",
		duration: "instantanée",
		description: "Un fort bruit résonnant, douloureusement intense, retentit d'un point de votre choix dans la portée du sort. Chaque créature présente dans une sphère d'un rayon de 3 mètres centrée sur ce point doit effectuer un jet de sauvegarde de Constitution, subissant 3d8 dégâts de tonnerre en cas d'échec, ou la moitié de ces dégâts en cas de réussite. Une créature constituée de matériau inorganique, comme la pierre, le cristal ou le métal, fait son jet de sauvegarde avec un désavantage.<br>Un objet non magique qui n'est pas porté ou transporté subit aussi les dégâts s'il est dans la zone du sort.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, les dégâts du sort augmentent de 1d8 pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Héroïsme",
		originalName: "Heroism",
		castedBy: [
			"bard",
			"paladin"
		],
		id: "74c739c7-7181-4e5a-8f3d-5f3a934a8346",
		level: 1,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Une créature consentante que vous touchez est submergée par le courage. Jusqu'à la fin du sort, la créature est immunisée contre la condition effrayé et gagne un nombre de points de vie temporaires égal au modificateur de votre caractéristique d'incantation, et ce au début de chacun de ses tours. Lorsque le sort prend fin, la cible perd tous les points de vie temporaires qu'il lui restait et qui lui avaient été conférés par ce sort.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Hurlement psychique",
		originalName: "Psychic Scream",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "e2d0a8a3-db4f-4a28-b4ac-a912ef9af1c6",
		level: 9,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "S",
		duration: "instantanée",
		description: "Jusqu'à 10 créatures doivent réussir un JdS d'Int. ou subir 14d6 dégâts psychiques."
	},
	{
		name: "Illusion mineure",
		originalName: "Minor Illusion",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "292a4a5c-5db1-4c12-b7cc-aa85f2211dc1",
		level: 0,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "S, M (un peu de laine de mouton)",
		duration: "1 minute",
		description: "Le lanceur de sorts crée un son ou l'image d'un objet à portée pendant une minute. Cette illusion se termine également si elle est révoquée au prix d'une action ou si ce sort est lancé une nouvelle fois.<br>Si l'illusion est un son, le volume peut aller d'un simple chuchotement à un cri. Il peut s'agir de votre voix, de la voix de quelqu'un d'autre, du rugissement d'un lion, d'un roulement de tambours, ou tout autre son que vous choisissez. Le son peut autant ne pas diminuer en intensité pendant la durée du sort qu'être discret et produit à différents instants dans cet intervalle de temps.<br>Si l'illusion est une image ou un objet (comme une chaise, des traces de pas boueuses ou un petit coffre) elle ne peut pas être plus large qu'un cube de 1,50 mètre d'arête. Cette image ne peut produire de son, lumière, odeur ou tout autre effet sensoriel. Une interaction physique avec l'image révèle l'illusion, car elle peut être traversée par n'importe quoi.<br>Si une créature utilise une action pour examiner le son ou l'image, elle peut comprendre qu'il s'agit d'une illusion grâce à un jet d'Intelligence (Investigation) contre le DD de sauvegarde de votre sort. Si une créature discerne l'illusion pour ce qu'elle est, l'illusion s'évanouit pour la créature.<br>"
	},
	{
		name: "Illusion programmée",
		originalName: "Programmed Illusion",
		castedBy: [
			"bard",
			"wizard"
		],
		id: "46694b90-fd62-4d75-a46b-2b0dbc51e155",
		level: 6,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (un bout de toison de mouton et de la poudre de jade d'une valeur d'au moins 25 po)",
		duration: "jusqu'à dissipation",
		description: "Vous créez l'image illusoire d'un objet, d'une créature, ou de tout autre phénomène visible dans la portée du sort et qui s'active sous certaines conditions. L'illusion est imperceptible avant que les conditions ne soient remplies. Elle doit tenir dans un cube de 9 mètres d'arête, et vous décidez, lorsque vous lancez ce sort, du comportement de l'illusion et des sons qu'elle émet. Cette animation programmée peut durer jusqu'à 5 minutes.<br>Lorsque les conditions que vous avez spécifiées sont remplies, l'illusion prend vie et exécute les animations et sons que vous avez prédéfinis. Une fois que l'illusion arrive à la fin de l'enchaînement, elle disparaît et reste inactive pendant 10 minutes. Après cette durée, l'illusion peut de nouveau être activée.<br>La condition de déclenchement peut être générale ou aussi détaillée que vous le souhaitez, elle doit cependant être basée sur un phénomène auditif ou visuel survenant à 9 mètres ou moins de la zone d'apparition de l'illusion. Par exemple, vous pourriez créer une illusion de vous-même qui apparaîtrait et mettrait en garde ceux qui tenteraient d'ouvrir une porte piégée, ou vous pourriez faire en sorte que l'illusion n'apparaisse que lorsqu'une créature prononce un mot ou une phrase spécifique.<br>Les interactions physiques avec l'image révèlent qu'il s'agit d'une illusion, car les choses passent au travers. Une créature qui utilise son action pour examiner l'image peut déterminer qu'il s'agit d'une illusion en réussissant un jet d'Intelligence (Investigation) contre le DD de sauvegarde de votre sort. Si une créature découvre le caractère illusoire de l'image, cette créature peut voir au travers de l'image, et tout son produit par l'illusion lui semble faux et sonne creux.<br>"
	},
	{
		name: "Image majeure",
		originalName: "Major Image",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "0a56c2a8-0193-4082-adf4-99d8d83aa77f",
		level: 3,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (un morceau de toison)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous créez l'image d'un objet, d'une créature ou d'un quelconque phénomène visible qui ne déborde pas d'un cube de 6 mètres d'arête. L'image apparait à un endroit visible dans la portée et pour la durée du sort. Elle parait bel et bien réelle, incluant les sons, les odeurs et la température appropriés à la chose montrée. Vous ne pouvez pas créer une chaleur ou un froid suffisamment intense pour infliger des dégâts, un son si fort qu'il inflige des dégâts de tonnerre ou qu'il assourdisse une créature ou bien une odeur qui pourrait rendre une créature malade (comme la puanteur d'un troglodyte).<br>Tant que vous êtes dans la portée de l'illusion, vous pouvez utiliser votre action pour déplacer l'image à un autre endroit dans la portée du sort. Au moment où l'image change d'endroit, vous pouvez modifier son apparence de sorte que le mouvement de l'image semble naturel. Par exemple, en supposant que vous créez l'image d'une créature et que vous la déplacez, vous pouvez changer l'image de telle sorte que la créature semble marcher. De la même manière, vous pouvez faire en sorte que l'illusion génère divers sons à des moments différents. Vous pouvez même simuler une conversation, par exemple.<br>Une interaction physique avec l'image révèle sa nature illusoire puisqu'on peut passer au travers. Une créature qui utilise son action pour examiner l'image peut conclure que c'est une image en réussissant un jet d'Intelligence (Investigation) contre le DD de sauvegarde de votre sort. Si une créature discerne l'illusion pour ce qu'elle est, la créature peut voir à travers l'image et les autres qualités sensorielles de l'image s'évanouissent aux yeux de la créature.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 6 ou supérieur, le sort persiste jusqu'au moment de sa dissipation, sans requérir de concentration.<br>"
	},
	{
		name: "Image silencieuse",
		originalName: "Silent Image",
		castedBy: [
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "917aec8b-61cf-4aa0-9a59-db820889127c",
		level: 1,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (un peu de laine de mouton)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous créez l'image d'un objet, d'une créature ou d'un autre phénomène visible dont les dimensions n'excèdent pas un cube de 4,50 mètres d'arête. L'image apparaît à un endroit choisi à l'intérieur de la portée du sort et perdure pendant toute la durée du sort. L'image est purement visuelle ; ce qui implique qu'elle n'est pas accompagnée par un son, une odeur ou d'autres effets sensoriels.<br>Vous pouvez utiliser votre action pour déplacer l'image à n'importe quel endroit dans la portée du sort. Comme l'image change de lieu, vous pouvez modifier son apparence afin que ses mouvements apparaissent fluides et naturels dans l'image. Par exemple, si vous créez l'image d'une créature et vous la déplacez, vous pouvez modifier l'image de sorte que la créature semble réellement marcher.<br>Une interaction physique avec l'image révèle qu'il s'agit d'une illusion, parce que les choses peuvent passer au travers. Une créature qui utilise son action pour examiner l'image peut déterminer qu'il s'agit en fait d'une illusion en réussissant un jet d'Intelligence (Investigation) contre votre DD du jet de sauvegarde de ce sort. Si une créature voit l'illusion pour ce qu'elle est, la créature peut voir à travers l'image.<br>"
	},
	{
		name: "Immobilisation de monstre",
		originalName: "Hold Monster",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "f93c3a10-b41a-46e4-a248-2c4b7e09d3eb",
		level: 5,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (une petite pièce de fer)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Choisissez une créature que vous pouvez voir et à portée. La cible doit réussir un jet de sauvegarde de Sagesse ou être paralysée pour la durée du sort. Ce sort n'a aucun effet contre les morts-vivants. À la fin de chacun de ses tours, la cible peut effectuer un nouveau jet de sauvegarde de Sagesse. En cas de réussite, le sort prend fin pour la créature.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 6 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d'emplacement au-delà du niveau 5. Les créatures doivent toutes être à 9 mètres les unes des autres quand vous les ciblez.<br>"
	},
	{
		name: "Immobilisation de personne",
		originalName: "Hold Person",
		castedBy: [
			"bard",
			"cleric",
			"druid",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "85513724-c716-4b09-87aa-c70150e99666",
		level: 2,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (un petit morceau de fer droit)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Choisissez un humanoïde visible dans la portée du sort. La cible doit réussir un jet de sauvegarde de Sagesse ou être paralysée pour la durée du sort. À la fin de chacun de ses tours, la cible peut faire un autre jet de sauvegarde de Sagesse. Si elle réussit, le sort prend fin.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, vous pouvez cibler un humanoïde supplémentaire pour chaque niveau d'emplacement au-delà du niveau 2. Les humanoïdes doivent être situés à 9 mètres ou moins les uns des autres.<br>"
	},
	{
		name: "Invisibilité supérieure",
		originalName: "Greater Invisibility Invisibilité suprême",
		castedBy: [
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "d3292918-f915-4b04-8b0a-157ad54aa8d2",
		level: 4,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous ou une créature que vous touchez devenez invisible jusqu'à la fin de la durée du sort. Tout ce que porte ou transporte la cible est invisible tant que ça demeure sur sa personne.<br>"
	},
	{
		name: "Localisation d'animaux ou de plantes",
		originalName: "Locate Animals or Plants",
		castedBy: [
			"bard",
			"druid",
			"ranger"
		],
		id: "b42e35e0-a405-4266-9078-9c74c7b62e8a",
		level: 2,
		school: "divination",
		isRitual: true,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (une touffe de fourrure de limier)",
		duration: "instantanée",
		description: "Décrivez ou nommez une espèce spécifique de bête ou de plante. En vous concentrant sur les murmures de la Nature qui vous environne, vous apprenez la direction et la distance de la créature, ou plante de cette espèce, la plus proche dans les 7,5 kilomètres à la ronde, à condition qu'il y en ait.<br>"
	},
	{
		name: "Localisation d'objet",
		originalName: "Locate Object",
		castedBy: [
			"bard",
			"cleric",
			"druid",
			"paladin",
			"ranger",
			"wizard"
		],
		id: "b744183d-5455-4335-98df-9d2d0aee9f81",
		level: 2,
		school: "divination",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (une petite brindille en forme de baguette de sourcier)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Décrivez ou nommez un objet qui vous est familier. Vous ressentez la direction de la position de l'objet, tant que cet objet se trouve à 300 mètres de vous maximum. Si l'objet est en déplacement, vous apprenez la direction de son mouvement.<br>Ce sort peut localiser un objet spécifique que vous connaissez, à condition que vous l'ayez déjà vu de près (à 9 mètres ou moins de vous) au moins une fois. Vous pouvez sinon faire en sorte que le sort localise l'objet le plus proche d'un type particulier, comme un type spécifique de vêtement, de bijoux, de meuble, d'objet ou d'arme.<br>Ce sort ne peut pas localiser un objet si une épaisseur de plomb, même une mince feuille, s'interpose sur la ligne de mire qui vous sépare vous et l'objet.<br>"
	},
	{
		name: "Localisation de créature",
		originalName: "Locate Creature",
		castedBy: [
			"bard",
			"cleric",
			"druid",
			"paladin",
			"ranger",
			"wizard"
		],
		id: "cd4624a3-34d9-40e6-9ad4-4917a8884c21",
		level: 4,
		school: "divination",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (quelques poils de chien de chasse)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Décrivez ou nommez une créature qui vous est familière. Vous percevez la direction vers le lieu où se situe la créature aussi longtemps qu'elle est à 300 mètres ou moins de vous. Si la créature se déplace, vous connaissez la direction de son déplacement.<br>Le sort peut localiser une créature spécifique que vous connaissez ou la plus proche créature d'une espèce particulière (comme un humain ou une licorne), à condition d'avoir déjà vu au moins une fois cette créature de près (à 9 mètres ou moins). Si la créature décrite ou nommée est dans une autre forme, en étant sous l'effet du sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=metamorphose\">métamorphose</a></em> notamment, le sort ne localise pas la créature.<br>Ce sort ne peut localiser une créature si un cours d'eau d'au moins 3 mètres de large fait obstacle à un trajet direct entre vous et la créature.<br>"
	},
	{
		name: "Malédiction",
		originalName: "Bestow curse",
		castedBy: [
			"bard",
			"cleric",
			"wizard"
		],
		id: "9471d7e9-1a80-43bf-b591-2038754a6b3d",
		level: 3,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous touchez une créature, elle doit alors réussir un jet de sauvegarde de Sagesse sous peine d'être affligée d'une malédiction pour toute la durée du sort. Lorsque vous lancez ce sort, choisissez la nature de la malédiction parmi les options qui suivent :<br>• Choisissez une valeur de caractéristique. Tant qu'elle est maudite, la cible a un désavantage à ses jets de caractéristique et de sauvegarde effectués avec la caractéristique en question.<br>• Tant qu'elle est maudite, la cible a un désavantage aux jets d'attaque qu'elle effectue contre vous.<br>• Tant qu'elle est maudite, la cible doit effectuer un jet de sauvegarde de Sagesse au début de chacun de ses tours. En cas d'échec, elle gaspille l'action de son tour à ne rien faire.<br>• Tant que la cible est maudite, vos attaques et sorts lui infligent 1d8 dégâts nécrotiques supplémentaires.<br>Un sort de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=delivrance-des-maledictions\">délivrance des malédictions</a></em> met fin à cet effet. À la discrétion du MD, vous pouvez choisir une autre option de malédiction que celles présentées, mais elle ne devrait pas être plus puissante que celles-ci-dessus. Le MD a le dernier mot concernant l'effet de la malédiction.",
		higherLevel: "Si vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, la durée de concentration maximale monte à 10 minutes. Si vous utilisez un emplacement de sort de niveau 5 ou supérieur, le sort dure 8 heures. Si vous utilisez un emplacement de sort de niveau 7 ou supérieur, le sort dure 24 heures. Si vous utilisez un emplacement de sort de niveau 9, le sort dure jusqu'à ce qu'il soit dissipé. Utiliser un emplacement de sort de niveau 5 ou supérieur permet de s'affranchir de la concentration en ce qui concerne la durée du sort.<br>"
	},
	{
		name: "Manoir somptueux de Mordenkainen",
		originalName: "Mordenkainen's Magnificent Mansion",
		castedBy: [
			"bard",
			"wizard"
		],
		id: "447c3e25-f538-4934-bcaf-196d7bf600cf",
		level: 7,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 minute",
		range: "90 mètres",
		components: "V, S, M (un portail miniature sculpté dans l'ivoire, un petit morceau de marbre poli, et une petite cuillère en argent, chacun valant au moins 5 po)",
		duration: "24 heures",
		description: "Vous invoquez une résidence extradimensionnelle à portée et qui reste en place pour la durée du sort. Vous choisissez où son entrée est située. L'entrée, qui miroite faiblement, est large de 1,50 mètre et haute de 3 mètres. Vous, et toute créature que vous désignez lorsque vous lancez le sort, pouvez entrer dans la résidence extradimensionnelle aussi longtemps que l'entrée reste ouverte. Vous pouvez ouvrir ou fermer le portail si vous vous trouvez à 9 mètres ou moins de lui. Tant qu'il est fermé, le portail est invisible.<br>De l'autre côté du portail se trouve un magnifique hall donnant sur de nombreuses salles. L'atmosphère est pure, agréable et chaleureuse.<br>Vous pouvez créer autant d'étage que vous le souhaitez, mais l'espace total ne peut pas dépasser 50 cubes, chaque cube mesurant 3 mètres d'arête. Vous choisissez l'ameublement et la décoration du lieu. Il contient suffisamment de nourriture pour servir un banquet-à-neuf-plats pour 100 personnes. Un personnel de 100 serviteurs quasi-transparents est au service de quiconque pénètre dans le manoir. Vous décidez de l'apparence visuelle de ces serviteurs et de leur livrée. Ils obéissent complètement à vos ordres. Chaque serviteur peut réaliser n'importe quelle tâche qu'un serviteur humain pourrait faire, mais ils ne peuvent pas attaquer ou entreprendre une action qui nuirait directement à une autre créature. Ainsi les serviteurs peuvent apporter des choses, nettoyer, réparer, plier le linge, allumer des feux, servir la nourriture, verser le vin, etc. Les serviteurs peuvent se déplacer de partout dans la demeure mais ne peuvent pas la quitter. Les meubles, et tout autre objet créé par ce sort, se dissipent dans un nuage de fumée dès l'instant où ils quittent le manoir. Lorsque le sort prend fin, toute créature se trouvant à l'intérieur de l'espace extradimensionnel est expulsée à l'endroit dégagé le plus proche de l'entrée.<br>"
	},
	{
		name: "Mauvais oeil",
		originalName: "Eyebite",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "9333cfdb-4b0a-469d-bd62-a5dba664f057",
		level: 6,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Pour la durée du sort, vos yeux prennent un couleur d'encre noire sont imprégnés du pouvoir de la mort. Une créature de votre choix, se trouvant à 18 mètres de vous et que vous pouvez voir, doit réussir un jet de sauvegarde de Sagesse sous peine d'être affectée par l'un des effets suivants (au choix) pour la durée du sort. À chacun de vos tours, jusqu'à ce que le sort prenne fin, vous pouvez utiliser votre action pour cibler une autre créature, vous ne pouvez cependant pas cibler une créature qui a déjà réussi son jet de sauvegarde contre ce sort de mauvais œil.<br><strong>Sommeil</strong>. La cible tombe inconsciente. Elle se réveille si elle subit des dégâts ou si une autre créature utilise son action pour la ramener du pays des songes en la secouant.<br><strong>Panique</strong>. Vous effrayez la cible. À chacun de ses tours, la créature effrayée doit prendre l'action Foncer et s'éloigner de vous par le chemin le plus sûr et le plus court, à moins qu'elle n'ait nulle part où aller. Si la cible atteint une zone située à au moins 18 mètres de vous et d'où elle ne peut pas vous voir, l'effet prend fin.<br><strong>Fièvre</strong>. La cible a un désavantage à ses jets d'attaque et à ses jets de caractéristique. À la fin de chacun de ses tours, elle peut effectuer un nouveau jet de sauvegarde de Sagesse. Si elle le réussit, l'effet prend fin.<br>"
	},
	{
		name: "Messager animal",
		originalName: "Animal Messenger",
		castedBy: [
			"bard",
			"druid",
			"ranger"
		],
		id: "c2d64179-dc42-4236-b41a-12b509164427",
		level: 2,
		school: "enchantment",
		isRitual: true,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (un morceau de nourriture)",
		duration: "24 heures",
		description: "Grâce à ce sort, vous employez un animal pour livrer un message. Choisissez une bête visible de taille TP, comme un écureuil, un geai bleu ou une chauve-souris. Vous précisez une destination, que vous avez préalablement visitée, et un destinataire qui correspond à une description sommaire, comme « un homme ou une femme vêtu d'un uniforme de la garde civile » ou « un nain roux portant un chapeau pointu ». Vous énoncez aussi un message de 25 mots ou moins. La bête ciblée se déplace pour la durée du sort vers la destination déterminée, au rythme de 75 kilomètres par 24 heures pour un messager ailé ou 37,5 kilomètres pour les autres animaux.<br>Lorsque le messager arrive, il livre son message à la créature que vous avez décrit en imitant le son de votre voix. Le messager parlera uniquement à la créature correspondant à la description que vous avez fournie. Si le messager ne parvient pas à sa destination avant la fin du sort, le message est perdu et la bête revient à l'endroit où le sort a été incanté.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, la durée du sort augmente de 48 heures pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Métamorphose",
		originalName: "Polymorph",
		castedBy: [
			"bard",
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "a3a6149e-1940-4af1-8732-8899aea33022",
		level: 4,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (un cocon de chenille)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Ce sort transforme une créature à portée que vous pouvez voir en une nouvelle forme. Une créature non consentante aura droit à un jet de sauvegarde de Sagesse pour annuler l'effet. Le sort n'a aucun effet sur un métamorphe ou une créature qui a 0 point de vie.<br>La transformation est effective pour la durée du sort, ou jusqu'à ce que la cible tombe à 0 point de vie ou meurt. La nouvelle forme peut être celle de n'importe quelle bête de FP inférieur ou égal à celui de la cible (ou de son niveau si elle n'a pas de FP). Les statistiques et valeurs de caractéristique de la cible, dont les caractéristiques mentales, sont remplacées par les caractéristiques de la bête choisie. La cible conserve son alignement et sa personnalité.<br>La cible remplace ses points de vie par ceux de la bête. Lorsqu'elle reprend sa forme normale, la créature retourne au nombre de points de vie qu'elle avait avant d'être transformée. Si elle retrouve sa forme normale parce qu'elle est tombée à 0 point de vie, tous les dégâts supplémentaires qu'elle a encaissés sous forme de bête sont appliqués à sa forme normale. Tant que les dégâts excédentaires ne font pas les points de vie de la forme normale de la créature à 0, la créature ne tombe pas inconsciente.<br>La créature est limitée dans les actions qu'elle peut entreprendre par la nature de sa nouvelle forme, et elle ne peut pas parler, ni lancer des sorts, ni effectuer la moindre action qui nécessite des mains ou la parole.<br>L'équipement de la cible fusionne avec sa nouvelle forme. La créature ne peut pas activer, utiliser, manipuler ou recevoir le moindre avantage de son équipement.<br>"
	},
	{
		name: "Métamorphose de groupe",
		originalName: "Mass Polymorph Métamorphose de masse",
		castedBy: [
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "400848f5-c709-452e-8a7f-88f06eea9454",
		level: 9,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (un cocon de chenille)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Transforme jusqu'à 10 créatures en nouvelles formes de bêtes de FP/niveau au plus égal au FP/niveau de la cible."
	},
	{
		name: "Métamorphose suprême",
		originalName: "True Polymorph",
		castedBy: [
			"bard",
			"warlock",
			"wizard"
		],
		id: "2ac8276e-a050-4352-b2ee-b8b12a36578d",
		level: 9,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (une goutte de mercure, une bonne dose de gomme arabique, et une volute de fumée)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Choisissez une créature ou un objet non magique que vous pouvez voir et à portée. Vous transformez la créature en une créature différente, la créature en un objet non magique, ou l'objet en une créature (l'objet ne doit ni être porté ni être tenu par une autre créature). La transformation reste effective pour toute la durée du sort, ou jusqu'à ce que la cible tombe à 0 point de vie ou meurt. Le sort ne peut pas affecter une cible dont les points de vie sont à 0. Si vous vous concentrez sur ce sort pendant toute sa durée, la transformation devient permanente.<br>Les métamorphes ne sont pas affectés par ce sort. Une créature non-consentante peut effectuer un jet de sauvegarde de Sagesse pour, si elle le réussit, ne pas être affectée par ce sort.<br><strong>Créature en créature</strong>. Si vous transformez une créature en un autre type de créature, la nouvelle forme peut être du type de votre choix à condition que le FP de la nouvelle forme soit inférieur ou égal à celui de la cible (ou à son niveau, si la cible n'a pas de facteur de puissance). Les statistiques de jeu de la cible, y compris ses valeurs de caractéristiques psychiques, sont remplacées par celles de la nouvelle forme. Elle conserve son alignement et sa personnalité. La cible obtient les points de vie de sa nouvelle forme, et lorsqu'elle retrouve sa forme normale, la créature récupère également les points de vie qu'elle avait avant d'être transformée. Si elle retrouve sa forme originelle parce que les points de vie de sa nouvelle forme sont tombés à 0, les dégâts restants sont infligés à sa forme normale. Tant que les dégâts restant ne font pas tomber la forme de la créature à 0 point de vie, elle ne sombre pas dans l'inconscience.<br>La créature est limitée dans les actions qu'elle peut entreprendre par la nature de sa nouvelle forme, et elle ne peut pas parler, ni lancer des sorts, ni effectuer la moindre action qui nécessite des mains ou la parole, à moins que sa nouvelle forme ne soit capable de telles actions.<br>L'équipement de la cible fusionne avec sa nouvelle forme. La créature ne peut pas activer, utiliser, manipuler ou recevoir le moindre avantage de son équipement.<br><strong>Objet en créature</strong>. Vous pouvez transformer un objet en une créature de n'importe quel type, à condition que la taille de la créature ne soit pas supérieure à celle de l'objet et que son FP soit inférieur ou égal à 9. La créature a une attitude amicale envers vous et vos compagnons. Elle agit à chacun de vos tours. Vous décidez des actions qu'elle effectue et de ses déplacements. Le MD possède les statistiques de la créature et résout ses actions et ses déplacements.<br>Si le sort devient permanent, vous ne pouvez plus contrôler la créature. Elle pourrait conserver son attitude amicale envers vous, en fonction de la manière dont vous l'avez traité.<br><strong>Créature en objet</strong>. Si vous transformez une créature en objet, elle endosse sa nouvelle forme avec tout l'équipement qu'elle transporte ou tient, à condition que la taille de l'objet ne soit pas supérieure à celle de la créature. Les statistiques de la créature deviennent celles de l'objet, et la créature n'a aucun souvenir du temps passé sous cette forme une fois qu'elle retrouve sa forme normale.<br>"
	},
	{
		name: "Mirage",
		originalName: "Mirage Arcane",
		castedBy: [
			"bard",
			"druid",
			"wizard"
		],
		id: "22e89f3e-7b08-4305-ba86-0d41152858dd",
		level: 7,
		school: "illusion",
		isRitual: false,
		castingTime: "10 minutes",
		range: "champ de vision",
		components: "V, S",
		duration: "10 jours",
		description: "Vous faites en sorte que le terrain, dans une zone carrée de 1,5 kilomètre de côté, ressemble à un autre type de terrain, que ce soit du point de vue de l'ouïe, de l'odorat, du toucher, et bien sûr de la vue. Toutefois, la forme générale du terrain reste la même. Une vaste plaine ou une route peuvent ressembler à un marais, une colline, une crevasse, ou tout autre terrain difficile ou infranchissable. Un étang peut ressembler à un pré verdoyant, un précipice à une pente douce, ou un ravin rocailleux à une large route plane.<br>Vous pouvez également modifier l'apparence des structures, ou en ajouter là où il n'en existe pas. Le sort ne peut pas déguiser, cacher, ou ajouter des créatures.<br>L'illusion inclut des éléments visuels, auditifs, tactiles et olfactifs, il peut donc convertir un terrain dégagé en terrain difficile (et vice versa), voire entraver les déplacements dans la zone. Lorsqu'une portion de l'illusion (comme une pierre ou une branche) est déplacée en dehors de la zone d'effet du sort, elle disparaît immédiatement.<br>Les créatures possédant la vision véritable peuvent voir la véritable forme du terrain au travers de l'illusion : cependant, tous les autres éléments de l'illusion restent en place, ainsi même si la créature est avertie de la présence de l'illusion, elle peut continuer à interagir physiquement avec l'illusion.<br>"
	},
	{
		name: "Modification de mémoire",
		originalName: "Modify Memory",
		castedBy: [
			"bard",
			"wizard"
		],
		id: "5b573127-cf80-4033-89a9-7d9656cabb5e",
		level: 5,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous tentez de remodeler la mémoire d'une autre créature. Une créature que vous pouvez voir doit effectuer un jet de sauvegarde de Sagesse. Si vous êtes en train de combattre la créature, elle obtient un avantage à son jet de sauvegarde. En cas d'échec, vous charmez la cible pour toute la durée du sort. La cible charmée est incapable d'agir et inconsciente de ce qui se passe autour d'elle, mais elle peut toutefois toujours vous entendre. Si elle subit des dégâts ou est la cible d'un autre sort, ce sort prend fin, et la mémoire de la cible n'est pas modifiée.<br>Tant qu'elle est charmée, vous pouvez modifier la mémoire de la cible concernant un événement qui s'est passé dans les 24 dernières heures et qui a duré au maximum 10 minutes. Vous pouvez supprimer de manière permanente tout souvenir de cet événement, permettre à la cible de se rappeler très clairement de cet événement ainsi que du moindre détail le concernant, modifier ses souvenirs concernant les détails de l'événement, ou lui implanter des souvenirs d'autres événements.<br>Vous devez parler à la cible pour lui décrire comme ses souvenirs sont affectés, et elle doit être capable de comprendre votre langage pour que les modifications de mémoire prennent racine. Son esprit comble les lacunes de votre description. Si le sort prend fin avant que vous n'ayez fini de décrire les modifications de mémoire de la cible, ses souvenirs ne sont pas altérés. Sinon, les modifications de mémoire prennent effet lorsque le sort se termine.<br>Une mémoire modifiée n'affecte pas nécessairement le comportement d'une créature, en particulier si les souvenirs sont en contradiction avec les tendances naturelles de la créature, avec son alignement, ou avec ses convictions. Une mémoire modifiée de manière illogique, comme l'implantation du souvenir de l'incroyable bonheur qu'a éprouvé la créature en prenant un bain d'acide, est ignorée, probablement un mauvais rêve. Le MD devrait faire en sorte qu'une mémoire modifiée de façon trop absurde n'affecte pas la créature de manière significative.<br>Un sort de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=delivrance-des-maledictions\">délivrance des malédictions</a></em> ou de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=restauration-superieure\">restauration supérieure</a></em> lancé sur la cible restaure la véritable mémoire de la créature.",
		higherLevel: "Si vous lancez ce sort en utilisant un emplacement de sort de niveau 6 ou supérieur, vous pouvez modifier la mémoire de la cible concernant un événement datant de 7 jours maximum (niveau 6), 30 jours maximum (niveau 7), 1 an maximum (niveau 8), ou de n'importe quelle période du passé de la créature (niveau 9).<br>"
	},
	{
		name: "Moquerie cruelle",
		originalName: "Vicious Mockery",
		castedBy: [
			"bard"
		],
		id: "294f39ad-b7aa-40f3-b8a2-621d1c347847",
		level: 0,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V",
		duration: "instantanée",
		description: "Vous vomissez un flot d'insultes entremêlées de subtils enchantements sur une créature à portée et que vous pouvez voir. Si la cible peut vous entendre (il n'est pas nécessaire qu'elle comprenne mais juste qu'elle devine votre intention), elle doit réussir un jet de sauvegarde de Sagesse ou subir 1d4 dégâts psychiques et avoir un désavantage au prochain jet d'attaque qu'elle fera avant la fin de son prochain tour.<br>Les dégâts de ce sort augmentent de 1d4 lorsque vous atteignez le niveau 5 (2d4), le niveau 11 (3d4) et le niveau 17 (4d4).<br>"
	},
	{
		name: "Mort simulée",
		originalName: "Feign Death État cadavérique",
		castedBy: [
			"bard",
			"cleric",
			"druid",
			"wizard"
		],
		id: "4531e02c-0410-4e8c-9ca3-cfa366f0f82a",
		level: 3,
		school: "necromancy",
		isRitual: true,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (une pincée de terre prélevée sur une tombe)",
		duration: "1 heure",
		description: "Vous touchez une créature consentante et la plongez dans un état cataleptique impossible à différencier de la mort.<br>Pour tout la durée du sort, ou jusqu'à ce que vous utilisiez une action pour toucher la cible et annuler le sort, la cible passe pour morte auprès de toute personne ne faisant pas une inspection approfondie ou face à des sorts censés donner l'état de santé de la cible. La cible est incapable d'agir et aveuglée, sa vitesse de déplacement tombe à 0. La cible obtient la résistance à tous les types de dégâts, à l'exception des dégâts psychiques. Si la cible est malade ou empoisonnée lorsque vous lancez ce sort, ou tombe malade ou empoisonnée alors qu'elle est déjà soumise à ce sort, la maladie ou le poison n'ont aucun effet jusqu'à ce que ce sort prenne fin.<br>"
	},
	{
		name: "Mot de guérison",
		originalName: "Healing Word",
		castedBy: [
			"bard",
			"cleric",
			"druid"
		],
		id: "967515e2-f34d-49d5-9321-20ed6a5f73c9",
		level: 1,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "18 mètres",
		components: "V",
		duration: "instantanée",
		description: "Une créature visible de votre choix récupère des points de vie à hauteur de 1d4 + le modificateur de votre caractéristique d'incantation. Ce sort n'a pas d'effet sur les morts-vivants et les artificiels.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les points de vie récupérés augmentent de 1d4 pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Mot de pouvoir étourdissant",
		originalName: "Power Word Stun",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "09c240b1-884d-4c34-865f-0077583a3f3b",
		level: 8,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V",
		duration: "instantanée",
		description: "Vous prononcez un mot de pouvoir qui peut submerger l'esprit d'une créature que vous pouvez voir et à portée de sort, la laissant abasourdie. Si la créature possède 150 points de vie ou moins, elle est étourdie. Dans le cas contraire, le sort n'a aucun effet.<br>La créature étourdie doit effectuer un jet de sauvegarde de Constitution à la fin de chacun de ses tours. Sur un jet réussi, l'étourdissement prend fin.<br>"
	},
	{
		name: "Mot de pouvoir guérisseur",
		originalName: "Power Word Heal",
		castedBy: [
			"bard"
		],
		id: "deea1af8-faab-4c10-889c-47468f101e9a",
		level: 9,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "instantanée",
		description: "Une vague d'énergie curative parcourt la créature que vous touchez. La cible récupère tous ses points de vie. Si la créature est charmée, effrayée, paralysée ou étourdie, cette condition prend fin. Si la créature est à terre, elle peut utiliser sa réaction pour se mettre debout. Ce sort n'a pas d'effet sur les morts-vivants et les artificiels.<br>"
	},
	{
		name: "Mot de pouvoir mortel",
		originalName: "Power Word Kill",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "54dac315-8fb9-4c98-8498-b623e8437066",
		level: 9,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V",
		duration: "instantanée",
		description: "Vous prononcez un mot de pouvoir qui peut contraindre une créature que vous pouvez voir et à portée de sort à mourir instantanément. Si la créature possède 100 points de vie ou moins, elle meurt. Dans le cas contraire, le sort n'a aucun effet.<br>"
	},
	{
		name: "Motif hypnotique",
		originalName: "Hypnotic Pattern",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "65578fc0-feed-4caa-9128-ea96137dc1d9",
		level: 3,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "S, M (un bâtonnet d'encens incandescent ou une fiole de cristal remplie d'une substance phosphorescente)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous créez des lueurs de couleurs changeantes qui emplissent les airs dans un cube de 9 mètres d'arête à portée. Les lueurs apparaissent pendant un moment et disparaissent. Chaque créature dans la zone d'effet qui voit les lueurs doit faire un jet de sauvegarde de Sagesse. Si elle échoue, la créature est charmée pour la durée du sort. Tant qu'elle est charmée par ce sort, la créature est incapable d'agir et a une vitesse égale à 0. Le sort prend fin pour une créature charmée si elle subit des dégâts ou si quelqu'un d'autre utilise son action pour la secouer et la sortir de sa torpeur.<br>"
	},
	{
		name: "Murmures dissonants",
		originalName: "Dissonant Whispers",
		castedBy: [
			"bard"
		],
		id: "a0e24038-56e7-4a0b-99d1-606cd6bf9dfc",
		level: 1,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V",
		duration: "instantanée",
		description: "Vous murmurez une mélodie discordante qui ne peut être entendue que par une créature de votre choix à portée, la tourmentant terriblement. La cible doit effectuer un jet de sauvegarde de Sagesse. En cas d'échec, elle subit 3d6 dégâts psychiques et doit immédiatement utiliser sa réaction, si elle est encore disponible, pour s'éloigner de vous aussi loin que sa vitesse le lui permet. La créature ne se déplace pas vers des sols manifestement dangereux, comme des flammes ou un gouffre. En cas de réussite, la cible subit la moitié de ces dégâts et n'est pas contrainte de se déplacer. Une créature assourdie réussit automatiquement son jet de sauvegarde.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts sont augmentés de 1d6 pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Mythes et légendes",
		originalName: "Legend Lore",
		castedBy: [
			"bard",
			"cleric",
			"wizard"
		],
		id: "f9a5f5d3-c3a6-490b-bd1b-def638ee0ef8",
		level: 5,
		school: "divination",
		isRitual: false,
		castingTime: "10 minutes",
		range: "personnelle",
		components: "V, S, M (de l'encens d'une valeur d'au moins 250 po, que le sort consume, et quatre bâtonnets d'ivoire d'une valeur d'au moins 50 po chacun)",
		duration: "instantanée",
		description: "Nommez ou décrivez une personne, un lieu ou un objet. Le sort apporte à votre esprit une brève et sommaire information à propos de la chose que vous avez nommée. L'information peut être présentée sous forme de contes, d'histoires oubliées ou même d'informations secrètes qui n'ont jamais été révélées. Si la chose que vous avez nommée n'a pas de résonance légendaire, vous n'obtenez aucune information. Plus vous avez déjà d'information à propos de la chose, plus précises et détaillées seront les informations que vous recevrez.<br>Ce que vous apprenez est précis mais peut être dissimulé dans un langage figuré. Par exemple, si vous avez une mystérieuse hache magique dans votre main, le sort peut révéler cette information : « Malheur au scélérat qui touche de ses mains la hache, car le manche tranchera celles du malin. Seul un vrai Enfant de la pierre, aimant et aimé de Moradin, pourrait réveiller le vrai pouvoir de cette hache, et seulement avec le mot sacré Rudnogg sur les lèvres ».<br>"
	},
	{
		name: "Nuage nauséabond",
		originalName: "Stinking Cloud",
		castedBy: [
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "9df5c325-a324-402f-a7d9-95b765fb158e",
		level: 3,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (un œuf pourri ou plusieurs feuilles de chou puant)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous créez une sphère de gaz jaune nauséabond de 6 mètres de rayon, centré sur un point à portée. Le nuage se propage dans tous les coins et la visibilité de la zone est fortement réduite. Le nuage persiste dans l'air pour la durée du sort.<br>Chaque créature totalement dans le nuage au début de son tour doit effectuer un jet de sauvegarde de Constitution contre le poison. En cas d'échec, la créature est prise de nausées et chancelle, perdant ainsi son action. Les créatures qui n'ont pas besoin de respirer ou qui sont immunisées contre le poison réussissent automatiquement leur jet de sauvegarde.<br>Un vent modéré (d'au moins 15 km/h) disperse le nuage après 4 rounds. Un vent fort (d'au moins 30 km/h) le disperse après 1 round.<br>"
	},
	{
		name: "Nuée de dagues",
		originalName: "Cloud of Daggers",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "df047e0e-ab61-4244-8029-6da640a23830",
		level: 2,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (un tesson de verre)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous emplissez l'espace de dagues tournoyantes dans un cube de 1,50 mètre d'arête, centré sur un point dans la portée du sort. Une créature subit 4d4 dégâts tranchants lorsqu'elle pénètre dans la zone du sort pour la première fois ou si elle y débute son tour.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, les dégâts augmentent de 2d4 pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Perturbations synaptiques",
		originalName: "Synaptic Static",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "d62f0a74-ca26-4555-8085-dfa09eae00fe",
		level: 5,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Les créatures dans un rayon de 6 m doivent réussir un JdS d'Int. ou subir 8d6 dégâts psychiques."
	},
	{
		name: "Petite hutte de Léomund",
		originalName: "Leomund's Tiny Hut",
		castedBy: [
			"bard",
			"wizard"
		],
		id: "7983f7c1-231a-4257-87e5-ca0961c7e4e1",
		level: 3,
		school: "evocation",
		isRitual: true,
		castingTime: "1 minute",
		range: "personnelle (hémisphère de 3 mètres de rayon)",
		components: "V, S, M (une petite perle de cristal)",
		duration: "8 heures",
		description: "Un dôme immobile de 3 mètres de rayon apparaît autour et au-dessus de vous et reste à cet endroit, immobile, jusqu'à la fin du sort. Le sort prend fin si vous quittez cette zone.<br>Neuf créatures de taille M ou inférieure peuvent tenir sous le dôme avec vous. Le sort échoue si la zone contient une créature plus grande ou plus de neuf créatures. Les créatures et objets qui se trouvent sous le dôme lorsque vous lancez ce sort peuvent en sortir et y rentrer librement. Toutes les autres créatures et objets sont bloqués et ne peuvent le traverser. Les sorts et effets magiques, lancés de l'intérieur ou de l'extérieur du dôme, ne peuvent pas non plus passer au travers. L'atmosphère dans la zone est confortable et sec, quel que soit le climat extérieur.<br>Jusqu'à ce que le sort prenne fin, vous pouvez faire en sorte que l'intérieur du dôme soit faiblement éclairé voire plongé dans les ténèbres. Le dôme est opaque depuis l'extérieur, de la couleur de votre choix, mais il est transparent depuis l'intérieur.<br>"
	},
	{
		name: "Peur",
		originalName: "Fear Terreur",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "06ece59d-91f8-4818-9066-2e7cb899f68f",
		level: 3,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (cône de 9 mètres)",
		components: "V, S, M (une plume blanche ou le cœur d'une poule)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous projetez une image fantasmatique des pires craintes d'une créature. Chaque créature dans un cône de 9 mètres doit réussir un jet de sauvegarde de Sagesse sous peine de lâcher ce qu'elle tient et être effrayée pour la durée du sort. Tant qu'elle est effrayée par ce sort, la créature doit utiliser l'action Foncer et s'éloigner de vous par le chemin disponible le plus sûr, et ce à chacun de ses tours, à moins qu'elle n'ait nulle part où aller. Si la créature termine son tour à un endroit où il n'y a aucune ligne de mire entre elle et vous, la créature peut effectuer un jet de sauvegarde de Sagesse. En cas de réussite, le sort prend fin pour cette créature.<br>"
	},
	{
		name: "Porte dimensionnelle",
		originalName: "Dimension Door",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "05a19f4b-ae87-46bc-b96a-b9f8bb941aac",
		level: 4,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "150 mètres",
		components: "V",
		duration: "instantanée",
		description: "Vous vous téléportez de votre position actuelle vers un autre endroit dans la portée du sort. Vous arrivez exactement à l'endroit désiré. Ce peut être un lieu que vous voyez, que vous visualisez ou que vous pouvez décrire en énonçant une distance et une direction, comme « 60 mètres droit devant » ou « vers le haut, à 45 degrés sur 90 mètres ».<br>Vous pouvez transporter des objets tant que leurs poids ne dépassent pas votre capacité de chargement. Vous pouvez aussi emmener une créature consentante de votre taille ou plus petite, qui porte de l'équipement jusqu'à sa capacité de chargement. La créature doit être à 1,50 mètre ou moins de vous lorsque vous lancez ce sort.<br>Si vous devriez arriver à un endroit déjà occupé par un objet ou une créature, vous et la créature se déplaçant avec vous subissez 4d6 dégâts de force et la téléportation échoue.<br>"
	},
	{
		name: "Prémonition",
		originalName: "Foresight",
		castedBy: [
			"bard",
			"druid",
			"warlock",
			"wizard"
		],
		id: "7703db1b-2a20-4cf9-bd06-47e0455d2b9c",
		level: 9,
		school: "divination",
		isRitual: false,
		castingTime: "1 minute",
		range: "contact",
		components: "V, S, M (la plume d'un colibri)",
		duration: "8 heures",
		description: "Vous touchez une créature consentante pour lui octroyer une faculté limitée de voir son futur immédiat. Pour la durée du sort, la cible ne peut être surprise et elle bénéficie d'un avantage aux jets d'attaque, de sauvegarde et de caractéristique. De plus, les jets d'attaque des autres créatures contre la cible ont un désavantage pour la durée du sort.<br>Le sort prend immédiatement fin si vous l'incantez à nouveau avant la fin de la durée.<br>"
	},
	{
		name: "Projection d'image",
		originalName: "Project Image Image projetée",
		castedBy: [
			"bard",
			"wizard"
		],
		id: "15db7249-c413-4c4e-9708-51f1be00c3ca",
		level: 7,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "750 kilomètres",
		components: "V, S, M (une petite réplique de vous faite à partir de matériaux valant au moins 5 po)",
		duration: "concentration, jusqu'à 1 jour",
		description: "Vous créez une copie illusoire de vous-même qui reste en place pour toute la durée du sort. La copie peut apparaître en n'importe quel lieu à portée que vous avez déjà vu, quels que soient les obstacles qui vous séparent. L'illusion vous ressemble et émet les mêmes sons que vous, mais elle est intangible. Si l'illusion subit des dégâts, elle disparaît, et le sort prend fin.<br>Vous pouvez utiliser votre action pour déplacer l'illusion d'une vitesse égale au double de la vôtre, pour la faire bouger, parler, et se comporter de la manière que vous souhaitez. L'illusion mime vos mimiques et vos manières à la perfection.<br>Vous pouvez voir à travers ses yeux et entendre via ses oreilles comme si vous y étiez. Pendant votre tour, par une action bonus, vous pouvez alterner entre vos sens à vous et ceux de votre illusion. Tant que vous utilisez vos sens, votre propre corps est aveuglé et assourdi vis-à-vis de ce qui l'entoure.<br>Les interactions physiques avec l'image révèlent qu'il s'agit d'une illusion, car les choses passent au travers. Une créature qui utilise son action pour examiner l'image peut déterminer qu'il s'agit d'une illusion en réussissant un jet d'Intelligence (Investigation) contre le DD de sauvegarde de votre sort. Si une créature découvre le caractère illusoire de l'image, cette créature peut voir au travers de l'image, et tout son produit par l'illusion lui semble faux et sonne creux.<br>"
	},
	{
		name: "Protection contre les armes",
		originalName: "Blade Ward",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "4dc70eff-189c-4de5-8a4f-a2032cb14bbb",
		level: 0,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "1 round",
		description: "Vous tendez votre main et tracez un symbole de protection dans les airs. Jusqu'à la fin de votre prochain tour, vous obtenez la résistance contre les dégâts contondants, tranchants et perforants infligés par des attaques avec arme.<br>"
	},
	{
		name: "Protections et sceaux",
		originalName: "Guards and Wards",
		castedBy: [
			"bard",
			"wizard"
		],
		id: "63917a94-9815-48c6-a7f3-11cd40d53960",
		level: 6,
		school: "abjuration",
		isRitual: false,
		castingTime: "10 minutes",
		range: "contact",
		components: "V, S, M (de l'encens allumé, une cuillerée de soufre et d'huile, une ficelle nouée, une petite quantité de sang de mastodonte des ombres, et un petit bâtonnet d'argent d'une valeur d'au moins 10 po)",
		duration: "24 heures",
		description: "Vous établissez des défenses magiques qui protègent jusqu'à 225 mètres carré d'espace au sol (un carré de 15 mètres de côté, ou une centaine de carrés de 1,50 mètre de côté, ou 25 carrés de 3 mètres de côté). La zone protégée magiquement peut faire jusqu'à 6 mètres de hauteur, et avoir la forme que vous désirez. Vous pouvez protéger plusieurs étages d'une forteresse en partageant la zone d'effet entre eux, tant que vous êtes capable de marcher entre chacune de ces zones de manière continue pendant que vous lancez ce sort.<br>Lorsque vous lancez ce sort, vous pouvez également spécifier un mot de passe qui, lorsqu'il est dit à haute voix, immunise la personne qui l'a prononcé des effets de ce sort.<br>Le sort <em>protections et sceaux</em> applique les effets suivants dans la zone protégée.<br><strong>Couloirs</strong>. De la brume remplit tous les couloirs protégés, les obscurcissant fortement. De plus, à chaque intersection ou embranchement offrant un choix de direction, il y a 50 % de chance qu'une autre créature que vous aille dans la direction opposée à celle qu'elle a choisie.<br><strong>Portes</strong>. Toutes les portes de la zone protégée sont verrouillées magiquement, comme si elles étaient sous l'effet du sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=verrou-magique\">verrou magique</a></em>. De plus, vous pouvez dissimuler jusqu'à 10 portes avec une illusion (équivalent à un objet illusoire formé à partir du sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=illusion-mineure\">illusion mineure</a></em>) qui leur donne l'apparence de portion de mur.<br><strong>Escaliers</strong>. Les toiles d'araignée remplissent tous les escaliers de la zone protégée, du sol au plafond, du début à la fin, comme avec le sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=toile-d-araignee\">toile d'araignée</a></em>. Les fibres de la toile repoussent au bout de 10 minutes s'ils ont été brûlés ou arrachés tant que le sort <em>protections et sceaux</em> est actif.<br><strong>Autres effets du sort</strong>. Vous pouvez installer l'un des effets magiques suivants dans la partie de la forteresse protégée par ce sort.<br>• Placez le sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=lumieres-dansantes\">lumières dansantes</a></em> dans quatre couloirs. Vous pouvez choisir un programme simple que les lumières répètent tant que le sort <em>protections et sceaux</em> est actif.<br>• Placez le sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=bouche-magique\">bouche magique</a></em> en deux endroits.<br>• Placez le sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=nuage-nauseabond\">nuage nauséabond</a></em> en deux endroits. Les vapeurs apparaissent aux endroits que vous désignez ; elles y réapparaissent au bout de 10 minutes si elles ont été dispersées par le vent tant que le sort <em>protections et sceaux</em> est actif.<br>• Placez un sort de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=bourrasque\">bourrasque</a></em> constant dans un couloir ou une pièce.<br>• Placez un sort de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=suggestion\">suggestion</a></em> dans un endroit. Vous choisissez une zone de 1,50 mètre de côté, et toute créature qui pénètre ou traverse la zone reçoit mentalement la suggestion.<br>Toute la zone protégée irradie la magie. Un sort de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=dissipation-de-la-magie\">dissipation de la magie</a></em> lancé sur un effet spécifique, s'il est couronné de succès, ne supprime que cet effet.<br>Vous pouvez faire en sorte que la structure que vous protégez le soit de manière permanente. Pour cela, lancez ce sort tous les jours pendant un an.<br>"
	},
	{
		name: "Quête",
		originalName: "Geas",
		castedBy: [
			"bard",
			"cleric",
			"druid",
			"paladin",
			"wizard"
		],
		id: "b9cb6075-100c-44e7-bb6f-e74ca4608718",
		level: 5,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 minute",
		range: "18 mètres",
		components: "V",
		duration: "30 jours",
		description: "Vous placez un ordre magique sur une créature que vous pouvez voir et à portée, la forçant ainsi à vous rendre service ou à s'interdire certaines actions ou activités, selon ce que vous décidez. Si la créature peut vous comprendre, elle doit réussir un jet de sauvegarde de Sagesse sous peine d'être charmée pour toute la durée du sort. Tant que vous charmez cette créature, elle subit 5d10 dégâts psychiques chaque fois qu'elle agit directement à l'encontre de vos instructions, mais pas plus d'une fois par jour. Une créature qui ne peut pas vous comprendre n'est pas affectée par ce sort.<br>Vous pouvez lui donner n'importe quel ordre de votre choix, à l'exception d'une activité qui se terminerait inévitablement par sa mort. Si vous lui donnez l'ordre de se suicider, le sort prend fin.<br>Vous pouvez mettre fin prématurément au sort en utilisant une action pour l'annuler. Un sort de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=delivrance-des-maledictions\">délivrance des malédictions</a>, <a href=\"https://www.aidedd.org/dnd/sorts.php?vf=restauration-superieure\">restauration supérieure</a></em> ou <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=souhait\">souhait</a></em> met également fin au sort.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 7 ou 8, la durée du sort passe à 1 an. Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 9, le sort persiste jusqu'à ce qu'il soit dissipé par l'un des sorts mentionnés ci-dessus.<br>"
	},
	{
		name: "Rappel à la vie",
		originalName: "Raise Dead",
		castedBy: [
			"bard",
			"cleric",
			"paladin"
		],
		id: "1ef25a39-86c5-4fcd-9825-5ccc34cf78d7",
		level: 5,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 heure",
		range: "contact",
		components: "V, S, M (un diamant valant au moins 500 po, que le sort consomme)",
		duration: "instantanée",
		description: "Vous ramenez à la vie une créature morte depuis moins de 10 jours. Si l'âme de la créature est à la fois consentante et libre de rejoindre le corps, la créature revient à la vie avec 1 point de vie.<br>Ce sort neutralise les poisons et guérit les maladies normales affligeant la créature au moment de sa mort. Cependant, il n'enraye pas les maladies magiques, les malédictions et autres affections du genre. Si de tels effets ne sont pas enrayés avant l'incantation du sort, ils affligent toujours la cible à son retour à la vie. Ce sort ne peut rappeler un mort-vivant à la vie.<br>Ce sort referme les blessures mortelles, mais il ne restaure pas les parties du corps qui ont été amputées. Si la créature a perdu des parties de son corps ou des organes essentiels à sa survie, comme la tête, le sort échoue automatiquement.<br>Revenir du monde des morts est une épreuve. La cible subit une pénalité de -4 à tous ses jets d'attaque, de sauvegarde et de caractéristique. À chaque fois que la cible termine un repos long, la pénalité est réduite de 1 jusqu'à ce qu'elle soit nulle.<br>"
	},
	{
		name: "Régénération",
		originalName: "Regenerate",
		castedBy: [
			"bard",
			"cleric",
			"druid"
		],
		id: "206bf721-d8fc-4116-83dd-9d429860cdf6",
		level: 7,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 minute",
		range: "contact",
		components: "V, S, M (un moulin à prières et de l'eau bénite)",
		duration: "1 heure",
		description: "Vous touchez une créature afin de stimuler sa capacité à guérir naturellement. La cible récupère 4d8 + 15 points de vie. Pour la durée du sort, la cible recouvre 1 point de vie au début de chacun de ses tours (10 points de vie par minute).<br>Les membres de la cible qui sont sectionnés (doigts, jambes, queues, etc.) repoussent après 2 minutes, le cas échéant. Si vous tenez le membre en question et que vous l'approchez du moignon, le sort permet de rattacher instantanément le membre au moignon.<br>"
	},
	{
		name: "Résurrection",
		originalName: "Resurrection",
		castedBy: [
			"bard",
			"cleric"
		],
		id: "eb00c6db-3235-43cb-a50d-4e2bd09265e8",
		level: 7,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 heure",
		range: "contact",
		components: "V, S, M (un diamant valant au moins 1 000 po, que le sort consomme)",
		duration: "instantanée",
		description: "Vous touchez une créature qui est morte depuis moins d'un siècle, qui n'est pas décédée de vieillesse et qui n'est pas un mort-vivant. Si son âme est libre et consentante, la cible revient à la vie avec tous ses points de vie.<br>Ce sort neutralise les poisons et guérit les maladies normales affligeant la créature au moment de sa mort. Cependant, il n'enraye pas les maladies magiques, les malédictions et autres affections du genre. Si de tels effets ne sont pas enrayés avant l'incantation du sort, ils affligent toujours la cible à son retour à la vie.<br>Ce sort referme les blessures mortelles et réhabilite les parties du corps qui ont été amputées.<br>Revenir du monde des morts est une épreuve. La cible subit une pénalité de -4 sur tous ses jets d'attaque, de sauvegarde et de caractéristique. À chaque fois que la cible termine un repos long, la pénalité est réduite de 1 jusqu'à ce qu'elle soit nulle.<br>Incanter ce sort pour redonner vie à une créature morte depuis plus d'une année vous handicape fortement. Jusqu'à ce que vous terminiez un repos long, vous ne pouvez pas incanter de sort et vous avez un désavantage à tous les jets d'attaque, de sauvegarde et de caractéristique.<br>"
	},
	{
		name: "Rêve du voile bleu",
		originalName: "Dream of the Blue Veil",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "b3fef908-c41d-402a-ad90-cdf002b3de66",
		level: 7,
		school: "conjuration",
		isRitual: false,
		castingTime: "10 minutes",
		range: "6 mètres",
		components: "V, S, M (un objet magique ou une créature volontaire du monde de destination)",
		duration: "6 heures",
		description: "Vous et jusqu'à 8 créatures consentantes tombez inconscients et êtes transportés dans un autre monde sur le plan matériel."
	},
	{
		name: "Scrutation",
		originalName: "Scrying",
		castedBy: [
			"bard",
			"cleric",
			"druid",
			"warlock",
			"wizard"
		],
		id: "95ec5e8c-054b-4bf3-a37b-1ff6c51b88f2",
		level: 5,
		school: "divination",
		isRitual: false,
		castingTime: "10 minutes",
		range: "personnelle",
		components: "V, S, M (un focaliseur d'une valeur d'au moins 1 000 po, comme une boule de cristal, un miroir en argent, ou une vasque remplie d'eau bénite)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous pouvez voir et entendre une créature spécifique que vous choisissez et qui se trouve dans le même plan d'existence que vous. La cible doit effectuer un jet de sauvegarde de Sagesse, avec un modificateur dépendant de votre niveau de connaissance et du lien physique qui vous relie à elle. Si la cible sait que vous lancez ce sort, elle peut choisir d'échouer volontairement son jet de sauvegarde si elle souhaite être observée.<br><table><tbody><tr><th>Connaissance</th><th class=\"center\">Modificateur<br>au jet de<br>sauvegarde</th></tr><tr><td>Seconde main (vous avez entendu parler de la cible)</td><td class=\"center\">+5</td></tr><tr><td>Première main (vous avez rencontré la cible)</td><td class=\"center\">+0</td></tr><tr><td>Familier (vous connaissez bien la cible)</td><td class=\"center\">−5</td></tr></tbody></table><br><table><tbody><tr><th>Lien</th><th class=\"center\">Modificateur<br>au jet de<br>sauvegarde</th></tr><tr><td>Un portrait ou un dessin</td><td class=\"center\">−2</td></tr><tr><td>Une possession ou un vêtement</td><td class=\"center\">−4</td></tr><tr><td>Un morceau de corps, une mèche de cheveux, un bout d'ongle, ou similaire</td><td class=\"center\">−10</td></tr></tbody></table><br>En cas de réussite au jet de sauvegarde, la cible n'est pas affectée et vous ne pouvez plus utiliser ce sort contre elle pendant 24 heures. En cas d'échec, le sort crée un capteur invisible à 3 mètres de la cible. Vous pouvez voir et entendre comme si vous étiez à la place du capteur. Le capteur se déplace avec la cible, restant à 3 mètres d'elle pour toute la durée du sort. Une créature qui peut voir l'invisible voit le capteur comme un orbe lumineux de la taille de votre poing. Plutôt que de cibler une créature, vous pouvez cibler un lieu que vous avez déjà vu par le passé. Dans ce cas, le capteur apparaît à l'endroit ciblé et ne bouge pas.<br>"
	},
	{
		name: "Secousse sismique",
		originalName: "Earth Tremor",
		castedBy: [
			"bard",
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "6e029088-063f-4da6-bec9-3532b92b6321",
		level: 1,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "3 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous causez un tremblement dans le sol à portée. Chaque créature autre que vous-même dans cette zone doit faire un jet de sauvegarde de Dextérité. En cas d'échec, la créature subit 1d6 dégâts contondants et se retrouve à terre. Si le sol dans cette zone est de la terre meuble ou de la pierre, il devient un terrain difficile jusqu'à qu'il soit déblayé, et chaque portion de la zone de 1,50 mètre de diamètre nécessite au moins 1 minute pour être nettoyée à la main.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts augmentent de 1d6 pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Sens de l'orientation",
		originalName: "Find the Path Orientation",
		castedBy: [
			"bard",
			"cleric",
			"druid"
		],
		id: "2a3a4c58-527a-488a-ac5c-428ce2e09417",
		level: 6,
		school: "divination",
		isRitual: false,
		castingTime: "1 minute",
		range: "personnelle",
		components: "V, S, M (un jeu d'outils divinatoires, comme des ossements, des bâtons d'ivoire, des cartes, des dents ou des runes gravées, valant au moins 100 po, et un objet originaire de l'endroit à atteindre)",
		duration: "concentration, jusqu'à 1 jour",
		description: "Ce sort vous permet de déterminer le chemin physique le plus court et le plus direct pour atteindre une destination déterminée avec laquelle vous êtes familier et qui se trouve sur le même plan d'existence. Si vous nommez une destination située sur un autre plan d'existence ou une destination mouvante (comme une forteresse mobile) ou une destination vague (comme « l'antre du dragon vert »), le sort échoue.<br>Pour la durée du sort, aussi longtemps que vous êtes sur le même plan d'existence que la destination, vous en connaissez la distance et la direction. Lorsque vous vous y déplacez, chaque fois que vous êtes confronté à un choix d'itinéraire, vous déterminez automatiquement lequel présente la route la plus courte et la plus directe (mais pas nécessairement la plus sure) vers votre destination.<br>"
	},
	{
		name: "Serviteur invisible",
		originalName: "Unseen Servant",
		castedBy: [
			"bard",
			"warlock",
			"wizard"
		],
		id: "843aa1f6-1abd-457a-af53-8c5e93fd6e14",
		level: 1,
		school: "conjuration",
		isRitual: true,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (un morceau de ficelle et un bout de bois)",
		duration: "1 heure",
		description: "Ce sort crée une force invisible, sans volonté propre, informe mais de taille M, qui exécute les ordres simples que vous lui transmettez, jusqu'à la fin du sort. Le serviteur prend vie dans un espace inoccupé sur le sol et à portée. Il possède les caractéristiques suivantes&nbsp;: CA 10 ; 1 point de vie ; Force 2 ; ne peut pas attaquer. Le sort se termine si le serviteur tombe à 0 point de vie.<br>Une fois par tour, par une action bonus, vous pouvez mentalement ordonner au serviteur de se déplacer de 4,50 mètres et d'interagir avec un objet. Le serviteur peut exécuter des tâches simples comme un serviteur humain le ferait, comme rapporter quelque chose, nettoyer, raccommoder, plier des vêtements, entretenir un feu, servir à manger, et verser du vin. Une fois votre ordre donné, le serviteur cherche à l'exécuter du mieux qu'il peut jusqu'à ce que la tâche soit accomplie, puis il attend votre ordre suivant.<br>Si vous demandez à votre serviteur d'effectuer une tâche qui devrait l'envoyer à plus de 18 mètres de vous, le sort prend fin.<br>"
	},
	{
		name: "Silence",
		originalName: "Silence",
		castedBy: [
			"bard",
			"cleric",
			"ranger"
		],
		id: "e6967c6f-deac-49e1-b899-557ac4aa44b5",
		level: 2,
		school: "illusion",
		isRitual: true,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Pour la durée du sort, aucun son ne peut être créé au sein (ou passer à travers) d'une sphère de 6 mètres de rayon centrée sur le point que vous choisissez dans la portée du sort. Toute créature ou objet se trouvant entièrement à l'intérieur de la sphère est immunisé contre les dégâts de tonnerre et les créatures sont en plus assourdies.<br>Lancer un sort qui comprend une composante verbale à l'intérieur de la sphère est impossible.<br>"
	},
	{
		name: "Soins de groupe",
		originalName: "Mass Cure Wounds",
		castedBy: [
			"bard",
			"cleric",
			"druid"
		],
		id: "2a5ce633-5ca8-4144-a2e0-74a90c026b4e",
		level: 5,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Un flot d'énergie curative émane d'un point de votre choix dans la portée du sort. Choisissez jusqu'à six créatures dans une sphère d'un rayon de 9 mètres centrée sur ce point. Chaque cible récupère un nombre de points de vie égal à 3d8 + le modificateur de votre caractéristique d'incantation. Ce sort n'a pas d'effet sur les morts-vivants et les artificiels.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 6 ou supérieur, la quantité de points de vie récupérés est augmentée de 1d8 pour chaque niveau d'emplacement au-delà du niveau 5.<br>"
	},
	{
		name: "Sommeil",
		originalName: "Sleep",
		castedBy: [
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "505a3a22-b0f0-4af9-9e61-63d911a7d935",
		level: 1,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (une pincée de sable fin, de pétales de rose ou un grillon)",
		duration: "1 minute",
		description: "Ce sort expédie les créatures dans un sommeil magique. Lancez 5d8 ; le total est le nombre de points de vie des créatures que ce sort peut affecter. Les créatures à 6 mètres ou moins du point que vous choisissez dans la portée du sort sont affectées par ordre croissant de leurs points de vie actuels (en ignorant les créatures inconscientes).<br>En commençant par la créature qui a le plus faible nombre de points de vie actuel, chaque créature affectée par ce sort tombe inconsciente jusqu'à ce que le sort se termine, que la créature endormie prenne des dégâts ou que quelqu'un utilise une action pour secouer ou frapper la créature endormie pour la réveiller. Soustrayez les points de vie de chaque créature du total permis par le sort avant de passer à la prochaine créature avec le plus faible nombre de points de vie. Le nombre de points de vie actuels d'une créature doit être égal ou inférieur au total restant permis par le sort pour que cette créature soit affectée.<br>Les morts-vivants et les créatures immunisées contre les effets de charme ne sont pas affectés par ce sort.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, lancez un 2d8 supplémentaire pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Songe",
		originalName: "Dream",
		castedBy: [
			"bard",
			"warlock",
			"wizard"
		],
		id: "7c7f1ee5-1c2c-4aad-ac94-5addbd24ae3d",
		level: 5,
		school: "illusion",
		isRitual: false,
		castingTime: "1 minute",
		range: "spéciale",
		components: "V, S, M (une poignée de sable, un peu d'encre et une plume arrachée d'un oiseau endormi)",
		duration: "8 heures",
		description: "Ce sort façonne les rêves d'une créature. Choisissez comme cible une créature que vous connaissez. La cible doit être située sur le même plan d'existence que vous. Les créatures qui ne dorment pas, comme les elfes, ne peuvent être contactées par ce sort. Vous, ou une cible consentante que vous touchez, entrez dans un état de transe, agissant comme un messager. Pendant la transe, le messager est conscient de son environnement, mais il ne peut ni agir, ni bouger.<br>Si la cible est endormie, le messager apparait dans les rêves de la cible et peut entretenir une conversation avec la cible aussi longtemps qu'elle reste endormie, dans la durée du sort. Le messager peut aussi façonner l'environnement du rêve en créant des paysages, des objets ou d'autres images. Le messager peut émerger de la transe à sa guise. Ce faisant, le sort se termine prématurément. La cible garde un souvenir précis du rêve à son réveil. Si la cible est éveillée lorsque vous incantez le sort, le messager le sait et il peut soit mettre un terme à la transe (et au sort), soit attendre que la cible s'endorme. Le messager apparait alors dans les rêves de la cible.<br>Le messager peut prendre la forme d'un monstre terrifiant aux yeux de la cible. Dans ce cas, le message peut livrer un message d'au plus dix mots et la cible doit réussir un jet de sauvegarde de Sagesse, sans quoi les échos d'une monstruosité fantasmagorique donnent naissance à un cauchemar qui persiste tout au long de la période de sommeil de la cible. Au terme de quoi, elle n'obtient pas les bénéfices de ce repos. De plus, lorsque la cible se réveille, elle subit 3d6 dégâts psychiques.<br>Si vous possédez une partie du corps, une mèche de cheveux, un ongle coupé ou une portion semblable du corps de la cible, celle-ci fait son jet de sauvegarde avec un désavantage.<br>"
	},
	{
		name: "Suggestion",
		originalName: "Suggestion",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "db714b33-df23-4105-ad45-3884f2ebc296",
		level: 2,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, M (une langue de serpent et un rayon de miel ou une goutte d'huile douce)",
		duration: "concentration, jusqu'à 8 heures",
		description: "Vous proposez un plan d'activité (limitée à une phrase ou deux) et influencez magiquement une créature que vous pouvez voir dans la portée du sort et qui peut vous entendre et vous comprendre. Les créatures qui ne peuvent pas être charmées sont à l'abri de cet effet. La suggestion doit être formulée de manière que la réalisation de l'action semble raisonnable. Demander à la créature de se poignarder, de s'empaler sur une lance, de s'immoler ou tout autre acte qui lui serait dommageable met un terme au sort.<br>La cible doit faire un jet de sauvegarde de Sagesse. En cas d'échec, elle poursuit le cours de l'action que vous avez décrit au mieux de ses possibilités. Le plan d'action proposé peut se poursuivre pendant toute la durée du sort. Si l'activité qui est suggérée peut être réalisée en un temps plus court, le sort prend fin lorsque le sujet termine ce qu'il lui a été demandé de faire.<br>Vous pouvez également spécifier des conditions qui déclencheront une activité spéciale pendant la durée du sort. Par exemple, vous pourriez suggérer à un chevalier de donner son cheval de bataille au premier mendiant qu'il rencontre. Si la condition n'est pas remplie avant que le sort expire, l'activité n'est pas effectuée.<br>Si vous, ou un de vos compagnons, blessez la cible, le sort se termine.<br>"
	},
	{
		name: "Suggestion de groupe",
		originalName: "Mass Suggestion",
		castedBy: [
			"bard",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "2934fb15-5cbd-47d0-a950-f81a616263c7",
		level: 6,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, M (une langue de serpent et un rayon de miel ou une goutte d'huile douce)",
		duration: "24 heures",
		description: "Vous proposez un plan d'activité (limitée à une phrase ou deux) et influencez magiquement jusqu'à 12 créatures que vous pouvez voir dans la portée du sort et qui peuvent vous entendre et vous comprendre. Les créatures qui ne peuvent pas être charmées sont à l'abri de cet effet. La suggestion doit être formulée de manière que la réalisation de l'action semble raisonnable. Demander à la créature de se poignarder, de s'empaler sur une lance, de s'immoler ou tout autre acte qui lui serait dommageable met un terme au sort.<br>Chacune des cibles doit faire un jet de sauvegarde de Sagesse. En cas d'échec, elle poursuit le cours de l'action que vous avez décrit au mieux de ses possibilités. Le plan d'action proposé peut se poursuivre pendant toute la durée du sort. Si l'activité qui est suggérée peut être réalisée en un temps plus court, le sort prend fin lorsque le sujet termine ce qu'il lui a été demandé de faire.<br>Vous pouvez également spécifier des conditions qui déclencheront une activité spéciale pendant la durée du sort. Par exemple, vous pourriez suggérer à un groupe de soldats d'offrir leurs bourses au premier mendiant qu'ils rencontrent. Si la condition n'est pas remplie avant que le sort expire, l'activité n'est pas effectuée.<br>Si vous, ou un de vos compagnons, blessez une des créatures sous l'effet de ce sort, il prend fin pour cette créature.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 7, la durée du sort augmente à 10 jours. Avec un emplacement de sort de niveau 8, la durée du sort augmente à 30 jours. Avec un emplacement de sort de niveau 9, la durée du sort augmente à une année plus un jour.<br>"
	},
	{
		name: "Symbole",
		originalName: "Symbol",
		castedBy: [
			"bard",
			"cleric",
			"wizard"
		],
		id: "8e6102d7-97d9-4b58-9bac-b77bedbbc3b8",
		level: 7,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 minute",
		range: "contact",
		components: "V, S, M (du mercure, du phosphore, et de la poudre de diamant et d'opale pour une valeur totale minimum de 1 000 po, que le sort consomme)",
		duration: "jusqu'à dissipation ou déclenchement",
		description: "Lorsque vous lancez ce sort, vous inscrivez un dangereux glyphe soit sur une surface (comme une table ou une portion de plancher ou de mur) ou à l'intérieur d'un objet qui peut être fermé pour dissimuler le glyphe (comme un livre, un rouleau de parchemin ou un coffre). Si vous optez pour la surface, le glyphe peut couvrir une superficie de 3 mètres de diamètre maximum. Si vous choisissez un objet, cet objet doit rester en place ; si l'objet est déplacé à plus de 3 mètres de l'endroit où le sort a été lancé, le glyphe est brisé, et le sort prend fin sans s'être déclenché.<br>Le glyphe est pratiquement invisible et un jet d'Intelligence (Investigation) contre le DD de sauvegarde de votre sort est requis pour le découvrir.<br>Vous déterminez le déclencheur du glyphe lors de l'incantation du sort. Pour les glyphes inscrits sur une surface, les déclencheurs sont typiquement le toucher ou se tenir sur un glyphe, retirer un objet posé sur le glyphe, s'approcher à une certaine distance du glyphe ou manipuler l'objet gardé par le glyphe. Pour les glyphes inscrits dans un objet, les déclencheurs les plus fréquents sont : ouvrir l'objet, s'approcher à une certaine distance de l'objet, apercevoir ou lire le glyphe.<br>Vous pouvez affiner les conditions de déclenchement de sorte que le sort ne s'active que dans certaines circonstances ou en fonction des attributs physiques de la créature (comme sa taille ou son poids), son type morphologique (par exemple, le glyphe pourrait n'affecter que les guenaudes ou les métamorphes). Vous pouvez aussi spécifier que certaines créatures ne déclenchent pas le glyphe, en utilisant un mot de passe, par exemple.<br>Lorsque vous inscrivez le glyphe, choisissez l'un des options suivantes pour déterminer son effet. Une fois déclenché, le glyphe rougeoie, emplissant une sphère de 18 mètres de rayon de lumière faible pendant 10 minutes, après quoi le sort prend fin. Chaque créature présente dans la sphère lorsque le glyphe est activé est ciblée par son effet, tout comme les créatures qui pénètrent dans la sphère pour la première fois de leur tour ou celles qui y finissent leur tour.<br><strong>Mort</strong>. Chaque créature doit effectuer un jet de sauvegarde de Constitution, subissant 10d10 dégâts nécrotiques en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br><strong>Discorde</strong>. Chaque cible doit effectuer un jet de sauvegarde de Constitution. En cas d'échec, une cible se chamaille et se dispute avec les autres créatures pendant 1 minute. Pendant cette période, elle est incapable de communiquer de manière claire et distincte et a un désavantage à ses jets d'attaque et à ses jets de caractéristique.<br><strong>Peur</strong>. Chaque cible doit réussir un jet de sauvegarde de Sagesse sous peine d'être effrayée pendant 1 minute. Tant qu'elle est effrayée, la cible lâche tout ce qu'elle tient et doit s'éloigner du glyphe d'au moins 9 mètres à chaque tour, si elle le peut.<br><strong>Désespoir</strong>. Chaque cible doit effectuer un jet de sauvegarde de Charisme. En cas d'échec, la cible est accablée de désespoir pendant 1 minute. Pendant cette période, elle ne peut ni attaquer, ni cibler de créature avec des capacités, sorts, ou effets magiques néfastes.<br><strong>Démence</strong>. Chaque cible doit effectuer un jet de sauvegarde d'Intelligence. En cas d'échec, la cible est en proie à la folie pendant 1 minute. Une créature démente ne peut pas utiliser d'action, ne peut ni comprendre ce que les autres créatures disent ni lire, et ne plus parler qu'un charabia inintelligible. Le MD contrôle les mouvements de la cible, qui sont imprévisibles.<br><strong>Douleur</strong>. Chaque cible doit réussir un jet de sauvegarde de Constitution sous peine d'être incapable d'agir pendant 1 minute à causes des atroces souffrances qui l'assaillent.<br><strong>Sommeil</strong>. Chaque cible doit réussir un jet de sauvegarde de Sagesse sous peine de sombrer dans l'inconscience pendant 10 minutes. Une créature est réveillée si elle subit des dégâts ou si quelqu'un utilise son action pour la réveiller en la secouant ou la giflant.<br><strong>Étourdissement</strong>. Chaque cible doit réussir un jet de sauvegarde de Sagesse sous peine d'être étourdie pendant 1 minute.<br>"
	},
	{
		name: "Téléportation",
		originalName: "Teleport",
		castedBy: [
			"bard",
			"sorcerer",
			"wizard"
		],
		id: "adf36a31-c7f6-4aec-a205-042e27a1c456",
		level: 7,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "3 mètres",
		components: "V",
		duration: "instantanée",
		description: "Ce sort vous transporte instantanément vous et jusqu'à huit créatures consentantes de votre choix, ou un seul objet, à condition dans les deux cas que vous puissiez les voir dans la limite de la portée du sort, vers une destination que vous déterminez. Si vous ciblez un objet, il doit être possible de l'insérer entièrement à l'intérieur d'un cube de 3 mètres d'arête et il ne peut être tenu ou porté par une créature non consentante.<br>La destination que vous choisissez doit vous être connue et doit être sur le même plan d'existence que vous. Votre connaissance de la destination détermine si vous y arrivez avec succès. Le MD lance un d100 et consulte la table.<br><table><tbody><tr><th>Familiarité</th><th>Incident</th><th>Zone similaire</th><th>Hors cible</th><th>Sur la cible</th></tr><tr><td>Cercle permanent</td><td class=\"center\">—</td><td class=\"center\">—</td><td class=\"center\">—</td><td class=\"center\">01-100</td></tr><tr><td>Objet associé</td><td class=\"center\">—</td><td class=\"center\">—</td><td class=\"center\">—</td><td class=\"center\">01-100</td></tr><tr><td>Très familier</td><td class=\"center\">01-05</td><td class=\"center\">06-13</td><td class=\"center\">14-24</td><td class=\"center\">25-100</td></tr><tr><td>Vu par hasard</td><td class=\"center\">01-33</td><td class=\"center\">34-43</td><td class=\"center\">44-53</td><td class=\"center\">54-100</td></tr><tr><td>Vu une seule fois</td><td class=\"center\">01-43</td><td class=\"center\">44-53</td><td class=\"center\">54-73</td><td class=\"center\">74-100</td></tr><tr><td>Description</td><td class=\"center\">01-43</td><td class=\"center\">44-53</td><td class=\"center\">54-73</td><td class=\"center\">74-100</td></tr><tr><td>Fausse destination</td><td class=\"center\">01-50</td><td class=\"center\">51-100</td><td class=\"center\">—</td><td class=\"center\">—</td></tr></tbody></table><br><strong><em>Familiarité</em></strong>. « Cercle permanent » désigne un cercle permanent de téléportation dont vous connaissez la séquence des symboles.<br>« Objet associé » signifie que vous possédez un objet pris de la destination souhaitée et cela à l'intérieur d'une période correspondant aux six derniers mois, comme un livre de la bibliothèque d'un magicien, le drap d'un lit d'une suite royale ou un morceau de marbre du tombeau secret d'une liche.<br>« Très familier » est un endroit où vous avez été très souvent, que vous avez déjà soigneusement étudié ou un endroit que vous pouvez voir lorsque vous lancez le sort.<br>« Vu par hasard » est un endroit que vous avez vu plus d'une fois, mais duquel vous n'êtes pas très familier.<br>« Vu une seule fois » est un endroit que vous n'avez vu qu'une fois, possiblement en utilisant la magie.<br>« Description » est un lieu dont vous ignorez l'emplacement et l'apparence, mais qui correspond à la description de quelqu'un d'autre ou, peut-être, simplement déterminé approximativement à partir d'une carte.<br>« Fausse destination » est un lieu qui n'existe pas. Peut-être avez-vous essayé de scruter le sanctuaire d'un ennemi, mais votre vision s'est butée à une illusion ou vous avez essayé de vous téléporter à un endroit familier dont l'emplacement n'existe plus.<br><strong><em>Sur la cible</em></strong>. Vous et votre groupe (ou l'objet ciblé) apparaissez où vous voulez.<br><strong><em>Hors cible</em></strong>. Vous et votre groupe (ou l'objet ciblé) apparaissez à une distance aléatoire loin de la destination et dans une direction aléatoire. La distance hors cible est 1d10 × 1d10 % de la distance qui devait être parcourue initialement. Par exemple, si vous avez essayé de parcourir 180 kilomètres, mais avez atterri hors cible et obtenu un 5 et un 3 sur les deux d10, alors vous seriez hors cible de 15 %, soit à 27 kilomètres de là. Le MD détermine la direction de la cible au hasard en lançant un d8 et désignant 1 comme le nord, 2 comme le nord-est, 3 comme l'est, et ainsi de suite autour des points cardinaux. Si vous étiez supposé être téléporté dans une ville côtière, mais que votre destination dérive finalement de plus de 27 kilomètres en pleine mer, vous pourriez être alors en difficulté.<br><strong><em>Zone similaire</em></strong>. Vous et votre groupe (ou l'objet ciblé) vous retrouvez dans une autre zone qui est visuellement ou thématiquement similaire à la zone ciblée. Si vous ciblez la position de votre laboratoire personnel, par exemple, vous pourriez vous retrouver dans le laboratoire d'un autre magicien ou dans une autre échoppe de fournitures magiques ayant sensiblement les mêmes outils et instruments que votre laboratoire. En règle générale, vous apparaissez dans le lieu similaire le plus proche, mais puisque le sort n'a pas vraiment de limite de portée pour la destination, vous pourriez également vous retrouver n'importe où dans le plan d'existence.<br><strong><em>Incident</em></strong>. Les effets magiques imprévisibles du sort résultent en un voyage périlleux. Chaque créature téléportée (ou l'objet ciblé) subit 3d10 dégâts de force et le MD relance sur la table pour voir où vous vous retrouvez à présent (plusieurs incidents peuvent alors se produire de suite, infligeant des dégâts à chaque fois).<br>"
	},
	{
		name: "Terrain hallucinatoire",
		originalName: "Hallucinatory Terrain",
		castedBy: [
			"bard",
			"druid",
			"warlock",
			"wizard"
		],
		id: "203f4f97-4cf8-4aa0-9d9b-6d083b6e4006",
		level: 4,
		school: "illusion",
		isRitual: false,
		castingTime: "10 minutes",
		range: "90 mètres",
		components: "V, S, M (un caillou, une brindille et un bout de plante verte)",
		duration: "24 heures",
		description: "Vous faites en sorte qu'un terrain dans un cube de 45 mètres d'arête, à portée, paraisse (d'un point de vue auditif, olfactif et visuel) être d'un autre type de terrain naturel. Ainsi, un terrain à ciel ouvert ou une route peut ressembler à un marais, une colline, une crevasse, ou n'importe quel autre terrain difficile ou insurmontable. Un étang peut être illusoirement converti en prairie d'herbe verte, un précipice peut ressembler à une pente douce, et un ravin rocailleux peut prendre l'allure d'une large route plate. Les structures manufacturées, les équipements et les créatures dans la zone ne voient pas leur apparence changer.<br>Les caractéristiques palpables du terrain ne sont pas modifiées, ce qui fait que les créatures qui pénètrent dans la zone voient probablement au travers de l'illusion. Si la différence entre l'illusion et la réalité n'est pas évidente par le contact, une créature qui examine attentivement l'illusion peut tenter un jet d'Intelligence (Investigation) contre le DD de sauvegarde de votre sort pour ne plus en être affectée. Une créature qui comprend que l'illusion en est une, la voit comme une vague image superposée au terrain réel.<br>"
	},
	{
		name: "Texte illusoire",
		originalName: "Illusory Script",
		castedBy: [
			"bard",
			"warlock",
			"wizard"
		],
		id: "c1168775-8bfa-4043-885c-300ce2aebac6",
		level: 1,
		school: "illusion",
		isRitual: true,
		castingTime: "1 minute",
		range: "contact",
		components: "S, M (une encre à base de plomb d'une valeur d'au moins 10 po, que le sort consomme)",
		duration: "10 jours",
		description: "Vous écrivez sur un parchemin, du papier, ou tout autre matériau adapté à l'écriture, et l'imprégnez d'une puissante illusion qui reste en place pour toute la durée du sort.<br>Pour vous et pour toute créature que vous avez désignée lorsque vous avez lancé ce sort, l'écriture apparaît normalement, tracée de votre main, et transmet ce que vous souhaitiez communiquer lorsque vous avez lancé ce sort. Pour toutes les autres créatures, les écritures semblent être rédigées dans un dialecte inconnu ou magique, ce qui les rend inintelligibles. Vous pouvez sinon faire en sorte que les écritures transmettent un tout autre message, écrit d'une autre main et dans un autre langage, à condition que ce soit un langage que vous connaissiez.<br>Dans le cas où le sort serait dissipé, le texte original et l'illusion disparaissent tous les deux.<br>Une créature qui possède la vision véritable peut lire le message caché.<br>"
	},
	{
		name: "Vague tonnante",
		originalName: "Thunderwave",
		castedBy: [
			"bard",
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "18f66fe8-f84a-42f9-9a32-860bd00f6bde",
		level: 1,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (cube de 4,50 mètres d'arête)",
		components: "V, S",
		duration: "instantanée",
		description: "Une vague de force de tonnerre émane de vous. Toute créature se trouvant dans un cube de 4,50 mètres d'arête prenant origine à partir de vous-même doit effectuer un jet de sauvegarde de Constitution. En cas d'échec, la créature subit 2d8 dégâts de tonnerre et est repoussée de 3 mètres de vous. En cas de réussite, elle subit la moitié de ces dégâts et n'est pas repoussée.<br>En outre, les objets non fixés qui se trouvent entièrement dans la zone d'effet sont automatiquement repoussés de 3 mètres par l'effet du sort, et le sort émet un coup de tonnerre audible jusqu'à 90 mètres.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts augmentent de 1d8 pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Vent protecteur",
		originalName: "Warding Wind",
		castedBy: [
			"bard",
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "0529a4c6-b740-496e-8a17-77d6ca093363",
		level: 2,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Un vent fort (30 km/h) souffle autour de vous dans un rayon de 3 mètre et se déplace avec vous, restant centré sur vous. Le vent perdure pour la durée du sort.<br>Le vent a les effets suivants :<br>• Il vous rend sourd, ainsi que les autres créatures dans sa zone.<br>• Il éteint les flammes non protégées dans sa zone qui sont de la taille d'une torche ou plus petite.<br>• Il dissipe la vapeur, le gaz et le brouillard s'ils peuvent être dispersés par un vent fort.<br>• La zone est un terrain difficile pour les créatures autres que vous.<br>• Les attaques à distance avec une arme ont un désavantage si elles rentrent ou sortent de la zone de vent.<br>"
	},
	{
		name: "Vision suprême",
		originalName: "True Seeing",
		castedBy: [
			"bard",
			"cleric",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "7a7d61a4-b1ec-4346-a948-57fe4527ce06",
		level: 6,
		school: "divination",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (une pommade pour les yeux coûtant 25 po ; elle est fabriquée à partir d'une poudre de champignon, de safran et de graisse, et est consommée par le sort)",
		duration: "1 heure",
		description: "Ce sort donne à la créature consentante que vous touchez la capacité de voir les choses telles qu'elles sont réellement. Pour la durée du sort, la créature est dotée d'une vision véritable, remarque les portes secrètes cachées par magie et peut voir dans le plan éthéré jusqu'à une portée de 36 mètres.<br>"
	},
	{
		name: "Zone de vérité",
		originalName: "Zone of Truth",
		castedBy: [
			"bard",
			"cleric",
			"paladin"
		],
		id: "69c6208b-7759-47d2-91c7-b78d54937ba3",
		level: 2,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "10 minutes",
		description: "Vous créez une zone magique qui protège de la tromperie dans une sphère de 4,50 mètres de rayon centrée sur un point de votre choix à portée. Jusqu'à la dissipation du sort, une créature qui pénètre dans la zone du sort pour la première fois lors d'un tour ou qui y débute son tour, doit effectuer un jet de sauvegarde de Charisme. En cas d'échec, une créature ne peut pas délibérément dire un mensonge tant qu'elle se trouve dans la zone. Vous savez par ailleurs si une créature a réussi ou non son jet de sauvegarde.<br>Une créature affectée est consciente du sort et peut ainsi éviter de répondre à des questions auxquelles elle aurait normalement répondu par un mensonge. Une telle créature peut rester évasive dans ses réponses tant qu'elles restent dans les limites de la vérité.<br>"
	},
	{
		name: "Allié planaire",
		originalName: "Planar Ally",
		castedBy: [
			"cleric"
		],
		id: "0b039630-e9f6-42f0-b1b5-57157e2ec839",
		level: 6,
		school: "conjuration",
		isRitual: false,
		castingTime: "10 minutes",
		range: "18 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous sollicitez l'aide d'une entité d'Outremonde. Vous devez connaître l'être en question : un dieu, un primordial, un prince démon ou un autre être au pouvoir cosmique. Cette entité envoie un céleste, un élémentaire ou un fiélon qui lui est loyal pour vous aider, faisant apparaître cette créature dans un espace inoccupé à portée. Si vous connaissez le nom spécifique d'une créature, vous pouvez prononcer ce nom au moment de lancer ce sort pour invoquer précisément cette créature, mais vous risquez quand même de recevoir une autre créature (au choix du MD). <br>Lorsque la créature apparaît, elle n'est pas contrainte d'agir d'une manière particulière. Vous pouvez demander à la créature de vous rendre un service en échange d'un paiement, mais elle n'est pas obligée de s'exécuter. Un large éventail de requêtes s'offre à vous, des plus simples (« Fais-nous survoler le gouffre », « Aide-nous à combattre »\") aux plus complexes (« Espionne nos ennemis », « Protège-nous pendant notre incursion dans le donjon »). Vous devez être capable de communiquer avec la créature pour pouvoir négocier ses services. <br>Le paiement peut prendre diverses formes. Un céleste pourrait demander que vous fassiez une importante donation sous forme d'or ou d'objets magiques à un temple allié, tandis qu'un fiélon pourrait demander le sacrifice d'un être vivant ou une part du trésor. Certaines créatures pourraient vous rendre service à condition que vous acceptiez une quête pour elle. <br>Le tarif généralement pratiqué pour une tâche dont la durée est calculée en minutes est de 100 po par minute. Une tâche dont la durée se calcule en heures est de 1 000 po par heure. Et une tâche dont la durée se calcule en jours (jusqu'à un maximum de 10 jours) est de 10 000 po par jour. Le MD peut ajuster ces tarifs en fonction des raisons pour lesquelles vous lancez ce sort. Si la tâche s'accorde à l'éthique de la créature, le paiement pourrait être divisé par deux, voire non requis. Typiquement, une tâche non dangereuse ne requiert que la moitié du paiement suggéré ci-dessus, tandis qu'une tâche particulièrement dangereuse pourrait nécessiter une offrande beaucoup plus importante. Les créatures acceptent rarement les tâches qui semblent suicidaires. <br>Après qu'une créature ait accompli la tâche que vous lui avez confiée, ou lorsque la durée de service convenue arrive à échéance, la créature retourne sur son plan après vous avoir fait un rapport, si cela est approprié à la tâche ou si elle le peut. Si vous n'êtes pas capable de vous entendre sur le paiement de la tâche, la créature retourne immédiatement dans son plan d'origine. <br>Une créature enrôlée dans votre groupe compte comme un membre à part entière, recevant son quota de points d'expérience comme tous les autres membres. <br>"
	},
	{
		name: "Animation des morts",
		originalName: "Animate Dead",
		castedBy: [
			"cleric",
			"wizard"
		],
		id: "98a4b4d9-84de-42ed-b84c-6b1ae254820e",
		level: 3,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 minute",
		range: "3 mètres",
		components: "V, S, M (une goutte de sang, un morceau de chair et une pincée de poussière d'os)",
		duration: "instantanée",
		description: "Ce sort crée un serviteur mort-vivant. Choisissez un tas d'ossements ou le cadavre d'un humanoïde de taille M ou P dans la portée du sort. Votre sort insuffle un semblant de vie à la cible pour la relever en tant que créature morte-vivante. La cible devient un squelette si vous avez choisi des ossements, ou un zombi si vous avez choisi un cadavre (le MD possède les caractéristiques de la créature en question). <br>À chacun de vos tours, vous pouvez utiliser une action bonus pour commander mentalement les créatures que vous avez animées avec ce sort si elles sont à 18 mètres ou moins de vous. Si vous contrôlez plusieurs créatures, vous commandez simultanément autant de créatures que vous le souhaitez en donnant le même ordre à chacune d'elles. Vous décidez de l'action prise par la créature et du mouvement qu'elle fait. Vous pouvez aussi émettre une consigne générale, comme monter la garde devant une pièce ou dans un couloir. Si vous ne donnez aucun ordre, la créature ne fait que se défendre contre les créatures qui lui sont hostiles. Une fois qu'un ordre est donné, la créature s'exécute jusqu'à ce que la tâche soit complétée. <br>La créature est sous votre contrôle pour une période de 24 heures, à la fin de quoi elle cesse d'obéir à votre commandement. Pour maintenir le contrôle de la créature pour 24 heures supplémentaires, vous devez incanter ce sort sur la créature avant la fin de la période actuelle de 24 heures. L'usage de ce sort réaffirme votre contrôle sur 4 créatures ou moins animées par ce sort, plutôt que d'en animer une nouvelle. ",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, vous animez ou réaffirmez votre contrôle sur deux créatures mortes-vivantes additionnelles pour chaque niveau d'emplacement au-delà du niveau 3. Chaque créature doit provenir d'un cadavre ou d'un tas d'ossements différent. <br>"
	},
	{
		name: "Arme spirituelle",
		originalName: "Spiritual Weapon",
		castedBy: [
			"cleric"
		],
		id: "4c00b5ff-4fff-4016-819c-287fa3ca9290",
		level: 2,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "18 mètres",
		components: "V, S",
		duration: "1 minute",
		description: "Vous créez une arme spectrale qui flotte dans l'air, dans la portée et pour la durée du sort ou jusqu'à ce que vous incantiez ce sort à nouveau. Lorsque vous lancez ce sort, vous pouvez faire une attaque au corps à corps avec un sort contre une créature à 1,50 mètre ou moins de l'arme. Une attaque réussie inflige des dégâts de force équivalents à 1d8 + le modificateur de votre caractéristique d'incantation. <br>En tant qu'action bonus lors de votre tour, vous pouvez déplacer l'arme jusqu'à 6 mètres et réitérer l'attaque contre une créature à 1,50 mètre ou moins de l'arme. <br>L'arme peut prendre la forme de votre choix. Les clercs d'une divinité associée à une arme particulière (tel que Saint-Cuthbert connu pour sa masse d'armes ou Thor pour son marteau) peuvent faire en sorte que l'effet du sort prenne la forme de l'arme en question. ",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, les dégâts infligés augmentent de 1d8 pour chaque niveau d'emplacement pair supérieur au niveau 2. <br>"
	},
	{
		name: "Augure",
		originalName: "Augury",
		castedBy: [
			"cleric"
		],
		id: "045cfa2a-18f2-4af2-a5df-c11125a3c984",
		level: 2,
		school: "divination",
		isRitual: true,
		castingTime: "1 minute",
		range: "personnelle",
		components: "V, S, M (jeu de bâtonnets ou d'osselets spécialement inscrits valant au moins 25 po)",
		duration: "instantanée",
		description: "Que ce soit en jetant des bâtonnets incrustés de gemmes ou des osselets de dragon, en retournant des cartes ornées ou en usant d'autres outils divinatoires, vous recevez un présage de la part d'une entité surnaturelle à propos du résultat des actions que vous planifiez d'entreprendre au cours des 30 prochaines minutes. Le MD choisit de répondre à l'aide des présages suivants : <br>• Fortune : l'action a de bonnes chances d'être bénéfique. <br>• Péril : l'action aura des répercussions néfastes. <br>• Péril et fortune : les deux sont possibles. <br>• Rien : dans le cas où l'action ne devrait pas avoir de conséquences favorables ou néfastes. <br>Le sort ne considère pas les circonstances qui pourraient changer l'issue de la divination, comme l'incantation additionnelle de sorts ou la perte ou le gain d'un nouveau compagnon. <br>Si vous incantez le sort plus d'une fois avant la fin de votre prochain repos long, il y a une probabilité cumulative de 25 % de recevoir une réponse aléatoire, et ce, à chaque incantation après la première. Le MD fait ce jet en secret. <br>"
	},
	{
		name: "Aura sacrée",
		originalName: "Holy Aura",
		castedBy: [
			"cleric"
		],
		id: "f8727e1e-f7b6-4482-9738-51d578d0af36",
		level: 8,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (un minuscule reliquaire contenant une relique sacrée, comme par exemple un bout de la robe d'un saint ou un fragment de texte sacré. Le reliquaire doit valoir au moins 1 000 po)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Une lumière divine émane de vous pour former une douce radiation dans un rayon de 9 mètres autour de vous. Les créatures de votre choix dans ce rayon au moment d'incanter émettent une lumière faible sur un rayon de 1,50 mètre et bénéficient d'un avantage à tous les jets de sauvegarde. Les autres créatures ont un désavantage aux jets d'attaque contre les créatures touchées par le sort. De plus, lorsqu'un fiélon ou un mort-vivant frappent une créature touchée par le sort avec une attaque au corps à corps, l'aura s'illumine d'une lumière vive. L'attaquant doit réussir un jet de sauvegarde de Constitution, sans quoi il est aveuglé jusqu'à la fin du sort. <br>"
	},
	{
		name: "Bannissement",
		originalName: "Banishment",
		castedBy: [
			"cleric",
			"paladin",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "934eb171-335f-4332-8390-dcea241c2c2d",
		level: 4,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (un objet désagréable pour la cible)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous tentez d'envoyer dans un autre plan d'existence une créature à portée que vous pouvez voir. <br>La cible doit réussir un jet de sauvegarde de Charisme sous peine d'être bannie. <br>Si la cible est native du plan d'existence sur lequel vous êtes, vous bannissez la cible sur un demi-plan non-dangereux. Tant qu'elle s'y trouve, la cible est incapable d'agir. La cible y reste jusqu'à ce que le sort prenne fin, puis elle réapparaît à l'endroit qu'elle a quitté ou dans l'espace inoccupé le plus proche si cet endroit est occupé. <br>Si la cible est native d'un plan d'existence différent de celui sur lequel vous vous trouvez, la cible est bannie dans une petite détonation, retournant dans son plan d'existence. Si ce sort se termine avant qu'une minute ne se soit écoulée, la cible réapparaît dans l'espace qu'elle a quitté ou dans l'espace inoccupé le plus proche si cet endroit est déjà occupé. Sinon, la cible ne revient pas. ",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 5 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d'emplacement au-delà du niveau 4. <br>"
	},
	{
		name: "Barrière de lames",
		originalName: "Blade Barrier",
		castedBy: [
			"cleric"
		],
		id: "0822eff2-0621-43ce-b1c2-f21415a89f6b",
		level: 6,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous créez un mur de lames acérées et tourbillonnantes faites d'énergie magique. Le mur apparait dans la portée du sort et il persiste pour sa durée. Vous pouvez modeler un mur rectiligne mesurant jusqu'à 30 mètres de long, 6 mètres de haut et 1,50 mètre d'épaisseur, ou un mur circulaire mesurant jusqu'à 18 mètres de diamètre, 6 mètres de haut et 1,50 mètre d'épaisseur. Le mur confère un abri important (3/4) aux créatures situées derrière, et l'espace occupé par le mur est un terrain difficile. <br>Lorsqu'une créature pénètre dans la zone du mur pour la première fois de son tour ou lorsqu'elle débute son tour dans la zone, la créature doit effectuer un jet de sauvegarde de Dextérité, subissant 6d10 dégâts tranchants en cas d'échec, ou la moitié de ces dégâts en cas de réussite. <br>"
	},
	{
		name: "Bénédiction",
		originalName: "Bless",
		castedBy: [
			"cleric",
			"paladin"
		],
		id: "20508afa-f201-4426-8e85-75fab77ab43a",
		level: 1,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (une aspersion d'eau bénite)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous bénissez jusqu'à trois créatures de votre choix, dans la portée du sort. À chaque fois qu'une cible fait un jet d'attaque ou de sauvegarde avant la fin du sort, la cible peut lancer un d4 et ajouter le résultat au jet d'attaque ou de sauvegarde. ",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d'emplacement au-delà du niveau 1. <br>"
	},
	{
		name: "Blessure",
		originalName: "Inflict Wounds",
		castedBy: [
			"cleric"
		],
		id: "85a4dad4-e29c-4128-810b-86ba3eeb41dc",
		level: 1,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "instantanée",
		description: "Faites une attaque au corps à corps avec un sort contre une créature que vous pouvez toucher. En cas de réussite, la cible prend 3d10 dégâts nécrotiques. ",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts augmentent de 1d10 chaque niveau d'emplacement au-delà du niveau 1. <br>"
	},
	{
		name: "Bouclier de la foi",
		originalName: "Shield of Faith",
		castedBy: [
			"cleric",
			"paladin"
		],
		id: "ce36ff68-a98f-4177-887e-0b0f9e25bf61",
		level: 1,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "18 mètres",
		components: "V, S, M (un bout de texte saint écrit sur un petit parchemin)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Un champ scintillant apparaît et entoure une créature de votre choix dans la portée du sort, lui accordant un bonus de +2 à la CA pour la durée du sort. <br>"
	},
	{
		name: "Cercle magique",
		originalName: "Magic Circle",
		castedBy: [
			"cleric",
			"paladin",
			"warlock",
			"wizard"
		],
		id: "ffe94ab1-4fa0-4aa9-8343-3b0dd1af18f6",
		level: 3,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 minute",
		range: "3 mètres",
		components: "V, S, M (de l'eau bénite ou de la poudre d'argent et de fer d'une valeur d'au moins 100 po, que le sort consomme).",
		duration: "1 heure",
		description: "Vous créez un cylindre d'énergie magique haut de 6 mètres et d'un rayon de 3 mètres, centré sur un point du sol que vous pouvez voir et à portée. Des runes rayonnantes apparaissent aux endroits où le cylindre s'intersecte avec le sol, ou toute autre surface. <br>Choisissez un ou plusieurs de types de créature suivants : céleste, élémentaire, fée, fiélon ou mort-vivant. Le cercle affecte une créature du type choisi des manières suivantes&nbsp;: <br>• La créature ne peut volontairement pénétrer dans le cylindre par des moyens non magiques. Si la créature tente d'utiliser la téléportation ou le voyage extraplanaire pour y parvenir, elle doit d'abords réussir un jet de sauvegarde de Charisme. <br>• La créature a un désavantage à ses jets d'attaque effectués contre des cibles situées à l'intérieur du cylindre. <br>• Des cibles se trouvant à l'intérieur du cylindre ne peuvent pas être charmées, effrayées, ou possédées par la créature. <br>Lorsque vous lancez ce sort, vous pouvez décider que la magie fonctionne en sens inverse, empêchant alors les créatures du type spécifié de quitter le cylindre et protégeant les cibles se trouvant au dehors. ",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort niveau 4 ou supérieur, la durée augmente de 1 heure pour chaque niveau d'emplacement au-delà du niveau 3. <br>"
	},
	{
		name: "Champ antimagie",
		originalName: "Antimagic Field",
		castedBy: [
			"cleric",
			"wizard"
		],
		id: "25472f7e-9be3-4425-b52b-042eb5d72338",
		level: 8,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (sphère de 3 mètres de rayon)",
		components: "V, S, M (une pincée de poudre de fer ou quelques copeaux du même métal)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Une sphère invisible d'antimagie d'un rayon de 3 mètres vous englobe. Cet espace est dissocié de l'énergie magique qui s'étend dans le multivers. Dans la sphère, aucun sort ne peut être incanté, les créatures convoquées disparaissent et même les objets magiques deviennent ordinaires. Jusqu'à la fin du sort, la sphère reste centrée sur vous lors de vos mouvements. <br>Les sorts et les autres effets magiques, sauf ceux générés par un artéfact ou une divinité, sont réprimés à l'intérieur de la sphère et ils ne peuvent plus y pénétrer. Un emplacement utilisé pour incanter un sort réprimé est dépensé. Un effet est nul lorsqu'il est réprimé mais le temps continue de s'écouler pour le décompte de sa durée. <br><strong><em>Effets ciblés</em></strong>. Les sorts et autres effets magiques, tels que <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=projectile-magique\">projectile magique</a></em> ou <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=charme-personne\">charme-personne</a></em>, qui ciblent une créature ou un objet dans la sphère n'ont aucun effet sur la cible. <br><strong><em>Zones de magie</em></strong>. La zone d'un autre sort ou d'un effet magique, tel que <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=boule-de-feu\">boule de feu</a></em>, ne peut s'étendre dans la sphère. Si la sphère se superpose à une zone de magie, la partie commune est réprimée. Par exemple, les flammes créées par un <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=mur-de-feu\">mur de feu</a></em> sont réprimées à l'intérieur de la sphère, créant ainsi une ouverture dans le mur, si la portion commune est suffisamment grande. <br><strong><em>Sorts</em></strong>. Tout sort ou autre effet magique actif sur une créature ou un objet dans la sphère est réprimé pendant qu'il y est. <br><strong><em>Objets magiques</em></strong>. Les propriétés et les pouvoirs des objets magiques sont réprimés dans la sphère. Par exemple, une épée longue +1 présente dans la sphère fonctionne comme une épée longue ordinaire. <br>Les propriétés et les pouvoirs d'une arme magique sont réprimés s'ils sont utilisés contre une cible dans la sphère ou si l'arme est maniée par un attaquant dans la sphère. Si une arme magique ou une pièce de munition quitte entièrement la sphère (par exemple, si vous décochez une flèche magique ou si vous lancez une lance vers une cible en dehors de la sphère), la répression de la magie de l'objet cesse aussitôt qu'il la quitte. <br><strong><em>Déplacement magique</em></strong>. La téléportation et les déplacements planaires ne fonctionnent pas dans la sphère, quelle que soit l'origine ou la destination d'un tel déplacement magique. Un portail vers un autre lieu, un autre monde ou un autre plan d'existence, autant qu'une ouverture vers un espace extradimensionnel comme celui créé par le sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=corde-enchantee\">corde enchantée</a></em>, sont temporairement fermés tant qu'ils sont dans la sphère. <br><strong><em>Créatures et objets</em></strong>. Une créature ou un objet convoqué ou créé par magie disparait temporairement de la sphère. Une telle créature réapparait instantanément lorsque l'espace occupé par la créature n'est plus dans la sphère. <br><strong><em>Dissipation de la magie</em></strong>. Les sorts et les effets magiques tel que <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=dissipation-de-la-magie\">dissipation de la magie</a></em> n'ont aucun effet sur la sphère. De même, les sphères créées par des sorts de <em>champ antimagie</em> ne s'annulent pas l'une l'autre. <br>"
	},
	{
		name: "Changement de plan",
		originalName: "Plane Shift",
		castedBy: [
			"cleric",
			"druid",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "7d5aa41d-5529-42e0-b45c-19184da708b1",
		level: 7,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (une petite baguette fourchue en métal d'une valeur d'au moins 250 po, affiliée à un plan d'existence particulier)",
		duration: "instantanée",
		description: "Vous et jusqu'à huit créatures consentantes qui vous tenez par les mains en formant un cercle, êtes transportés dans un plan d'existence différent. Vous pouvez spécifier une destination en termes généraux, comme la Cité d'Airain dans le plan élémentaire du feu ou le palace de Dispater au deuxième niveau des Neuf enfers, et vous apparaissez dans, ou à proximité de votre destination. Si vous essayez d'atteindre la Cité d'Airain par exemple, vous pourriez arriver dans la rue du Métal, devant ses Portes de cendres, ou regardant la cité depuis l'autre côté de la Mer de feu, à la discrétion du MD. <br>Sinon, si vous connaissez la séquence des symboles d'un cercle de téléportation sur un autre plan d'existence, ce sort vous transporte jusqu'à ce cercle. Si le cercle de téléportation est trop petit pour contenir toutes les créatures que vous transportez, elles apparaissent dans l'espace inoccupé le plus proche du cercle. <br>Vous pouvez utiliser ce sort pour bannir une créature non consentante dans un autre plan. Choisissez une créature à portée et faites un jet d'attaque au corps à corps avec un sort contre elle. Si vous la touchez, la créature doit effectuer un jet de sauvegarde de Charisme. En cas d'échec, elle est transportée à un endroit aléatoire du plan d'existence que vous avez visé. Une créature transportée de la sorte devra trouver elle-même un moyen de revenir dans votre plan d'existence. <br>"
	},
	{
		name: "Colonne de flamme",
		originalName: "Flame Strike",
		castedBy: [
			"cleric"
		],
		id: "f7d312e5-b0b3-456d-a994-937c5cac7243",
		level: 5,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (une pincée de soufre)",
		duration: "instantanée",
		description: "Une colonne verticale de feu divin dévale des cieux vers un endroit que vous spécifiez dans la portée du sort. Chaque créature située dans un cylindre de 3 mètres de rayon et de 12 mètres de haut centré sur le point spécifié doit effectuer un jet de sauvegarde de Dextérité, subissant 4d6 dégâts de feu et 4d6 dégâts radiants en cas d'échec, ou la moitié de ces dégâts en cas de réussite. ",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 6 ou supérieur, les dégâts de feu ou les dégâts radiants (selon votre choix) sont augmentés de 1d6 pour chaque niveau d'emplacement au-delà du niveau 5. <br>"
	},
	{
		name: "Communion",
		originalName: "Commune",
		castedBy: [
			"cleric"
		],
		id: "1a3ffe12-5104-4072-9153-d3fbdeb2be2c",
		level: 5,
		school: "divination",
		isRitual: true,
		castingTime: "1 minute",
		range: "personnelle",
		components: "V, S, M (de l'encens et une fiole d'eau bénite ou maudite)",
		duration: "1 minute",
		description: "Vous entrez en contact avec votre dieu ou un intermédiaire divin et vous posez jusqu'à trois questions qui peuvent être répondues par oui ou par non. Vous devez poser vos questions avant la fin du sort. Vous recevez une réponse correcte à chaque question. <br>Les entités divines ne sont pas nécessairement omniscientes. Vous pouvez donc recevoir une réponse « incertaine » si la question concerne un sujet qui est hors du domaine de connaissance de la divinité. Dans le cas où une réponse monosyllabique s'avérerait déroutante ou opposée aux intérêts de la divinité, le MD peut faire une courte phrase en guise de réponse. <br>Si vous incantez le sort plus d'une fois avant la fin de votre prochain repos long, il y a une probabilité cumulative de 25 % de ne recevoir aucune réponse et ce, pour chaque incantation après la première. Le MD fait ce jet en secret. <br>"
	},
	{
		name: "Contagion",
		originalName: "Contagion",
		castedBy: [
			"cleric",
			"druid"
		],
		id: "a6efb45c-eff2-4de3-b3e2-99e240241595",
		level: 5,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "7 jours",
		description: "Votre toucher est vecteur de maladie. Effectuez une attaque au corps à corps avec un sort contre une créature à portée. Si le coup touche, la cible est empoisonnée. <br>À la fin de chacun des tours de la cible empoisonnée, celle-ci doit effectuer un jet de sauvegarde de Constitution. Si elle en réussit trois, la cible n'est plus empoisonnée et le sort prend fin. Si elle en échoue trois, la cible n'est plus empoisonnée mais vous choisissez une des maladies indiquées ci-dessous. La cible est alors sujette à cette maladie jusqu'à la fin de la durée du sort. <br>Étant donné que le sort reproduit une maladie naturelle chez sa cible, tout effet qui peut normalement guérir une maladie, ou au moins en réduire les effets, s'applique. <br><strong>Bouille-crâne</strong>. L'esprit de la créature devient fiévreux. La créature a un désavantage aux jets d'Intelligence et aux jets de sauvegarde d'Intelligence. De plus, la créature se comporte comme si elle était sous l'effet d'un sort de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=confusion\">confusion</a></em> lorsqu'elle est en combat. <br><strong>Convulsions</strong>. La créature est parcourue de tremblements incontrôlés. La créature a un désavantage aux jets de Dextérité, aux jets de sauvegarde de Dextérité et aux jets d'attaque basés sur la Dextérité. <br><strong>Fièvre répugnante</strong>. Une violente fièvre se saisit du corps de la créature. La créature a un désavantage aux jets de Force, aux jets de sauvegarde de Force et aux jets d'attaque basés sur la Force. <br><strong>Mal aveuglant</strong>. La créature a du mal à réfléchir et ses yeux deviennent blancs laiteux. La créature a un désavantage aux jets de Sagesse et aux jets de sauvegarde de Sagesse. Elle est de plus aveuglée. <br><strong>Mort poisseuse</strong>. La créature perd du sang de manière incontrôlable. La créature a un désavantage aux jets de Constitution et aux jets de sauvegarde de Constitution. De plus, chaque fois que la créature subit des dégâts, elle est étourdie jusqu'à la fin de son tour suivant. <br><strong>Pourriture</strong>. La chair de la créature se dégrade. La créature a un désavantage aux jets de Charisme et est vulnérable à tous les types de dégâts. <br>"
	},
	{
		name: "Contamination",
		originalName: "Harm",
		castedBy: [
			"cleric"
		],
		id: "66be2036-ce03-47aa-bcf5-9b31ee7c87d1",
		level: 6,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous libérez une infection virulente sur une créature que vous voyez dans la portée du sort. La cible doit effectuer un jet de sauvegarde de Constitution, subissant 14d6 dégâts nécrotiques en cas d'échec, ou la moitié de ces dégâts en cas de réussite. Les dégâts ne peuvent réduire les points de vie de la cible sous 1. Si la cible échoue le jet de sauvegarde, son maximum de points de vie est amputé pour 1 heure de la même quantité de dégâts nécrotiques subis. Tout effet qui enraye la maladie permet au maximum de points de vie de la créature de retrouver sa valeur normale avant la fin de l'effet du sort. <br>"
	},
	{
		name: "Contrôle de l'eau",
		originalName: "Control Water",
		castedBy: [
			"cleric",
			"druid",
			"wizard"
		],
		id: "20d29aa6-3bb1-416e-a543-070e5e3759e9",
		level: 4,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "90 mètres",
		components: "V, S, M (une goutte d'eau et une pincée de sable)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Jusqu'à la fin du sort, vous contrôlez toute étendue d'eau libre dans une zone cubique de 30 mètres d'arête de votre choix. Vous pouvez choisir parmi les effets suivants lors de l'incantation du sort. Par une action, durant votre tour, vous pouvez répéter le même effet ou en choisir un nouveau. <br><strong><em>Crue</em></strong>. Vous provoquez l'augmentation de 6 mètres du niveau de toute l'eau présente dans la zone d'effet. Si la zone d'effet comprend une berge, l'eau se déverse sur le sol sec. Si votre zone d'effet se trouve au sein d'une importante étendue d'eau, vous créez plutôt une vague de 6 mètres de haut qui part d'un côté de la zone d'effet et se déplace jusqu'au côté opposé avant de se briser. Tout véhicule de taille TG ou inférieure frappé par la vague a 25 % de risque de chavirer. Le niveau de l'eau reste élevé jusqu'à la fin du sort ou jusqu'à ce que vous choisissiez un effet différent. Si cet effet produit une vague, la vague se répète au début de votre tour suivant tant que l'effet de Crue est effectif. <br><strong><em>Scinder l'eau</em></strong>. Vous déplacez l'eau dans la zone de sorte à créer une tranchée. La tranchée s'étend au travers de la zone d'effet du sort, et scinde l'eau en deux, formant un mur de chaque côté. La tranchée reste en place jusqu'à la fin du sort ou jusqu'à ce que vous choisissiez un nouvel effet. L'eau remplit alors lentement la tranchée jusqu'au tour suivant, ramenant l'eau à son niveau normal. <br><strong><em>Diriger le courant</em></strong>. Vous provoquez un courant dans la zone d'effet qui se dirige dans la direction de votre choix, même si l'eau doit pour cela submerger des obstacles, passer au-dessus des murs, ou prendre d'autres directions improbables. L'eau dans la zone d'effet se déplace dans la direction souhaitée, mais une fois en dehors de la zone d'effet, elle retrouve un courant basé sur les caractéristiques du terrain. L'eau continue à se déplacer dans la direction choisie jusqu'à ce que le sort prenne fin ou que vous choisissiez un nouvel effet. <br><strong><em>Tourbillon</em></strong>. Cet effet requiert une étendue d'eau large de 15 mètres et profonde de 7,50 mètres minimum. Vous créez un tourbillon qui se forme au centre de la zone d'effet. Le tourbillon produit un vortex large de 1,50 mètre à son pôle inférieur, large de 15 mètres à son pôle supérieur, et profond de 7,50 mètres. Toute créature ou objet dans l'eau à 7,50 mètres du vortex est attiré de 3 mètres vers lui. Une créature peut nager pour s'éloigner du vortex à condition de réussir un jet de Force (Athlétisme) contre le DD de sauvegarde de votre sort. <br>Lorsqu'une créature entre dans le vortex pour la première fois de son tour ou débute son tour dans le vortex, elle doit effectuer un jet de sauvegarde de Force. En cas d'échec, la créature subit 2d8 dégâts contondants et est happée dans le vortex jusqu'à ce que le sort se termine. En cas de réussite, la créature subit la moitié de ces dégâts et n'est pas prisonnière du vortex. Une créature happée par le vortex peut utiliser son action pour essayer de nager hors du vortex comme décrit précédemment, mais elle subira un désavantage à son jet de Force (Athlétisme). <br>La première fois, à chaque tour, qu'un objet entre dans le vortex, l'objet subit 2d8 dégâts contondants ; ces dégâts sont de nouveau infligés à chaque tour que l'objet passe dans le vortex. <br>"
	},
	{
		name: "Contrôle du climat",
		originalName: "Control Weather",
		castedBy: [
			"cleric",
			"druid",
			"wizard"
		],
		id: "af69f59b-4c1c-4948-b0b1-bbc9789f38c3",
		level: 8,
		school: "transmutation",
		isRitual: false,
		castingTime: "10 minutes",
		range: "personnelle (rayon de 7,5 kilomètres)",
		components: "V, S, M (de l'encens qui brûle et des morceaux de terre et de bois mélangés à de l'eau)",
		duration: "concentration, jusqu'à 8 heures",
		description: "Vous prenez le contrôle du climat sur 7,5 kilomètres autour de vous pour la durée du sort. Vous devez être à l'extérieur pour lancer ce sort. Vous déplacer à un endroit d'où vous n'avez pas une vue dégagée sur le ciel met fin au sort prématurément. <br>Lorsque vous lancez ce sort, vous modifiez les conditions climatiques actuelles, qui sont déterminées par le MD en fonction du climat et de la saison. Vous pouvez modifier les précipitations, la température et le vent. Cela prend 1d4 x 10 minutes pour que de nouvelles conditions météorologiques prennent effets. Une fois qu'elles sont en place, vous pouvez les modifier à nouveau. Lorsque le sort prend fin, le climat retourne progressivement à la normale. Lorsque vous modifiez les conditions climatiques, cherchez l'état climatique actuel dans les tables ci-dessous et modifiez cet état d'un rang, inférieur ou supérieur. Lorsque vous modifiez le vent, vous pouvez en modifier la direction. <br><br><strong>Précipitation</strong> <br> <table>     <tbody><tr>         <th class=\"center\">État</th>         <th>Condition</th>     </tr>     <tr>         <td class=\"center\">1</td>         <td>Dégagé</td>     </tr>     <tr>         <td class=\"center\">2</td>         <td>Nuages légers</td>     </tr>     <tr>         <td class=\"center\">3</td>         <td>Ciel couvert ou brouillard</td>     </tr>     <tr>         <td class=\"center\">4</td>         <td>Pluie, neige ou grêle</td>     </tr>     <tr>         <td class=\"center\">5</td>         <td>Pluie torrentielle, tempête de grêle ou blizzard</td>     </tr> </tbody></table> <br><strong>Température</strong> <br> <table>     <tbody><tr>         <th class=\"center\">État</th>         <th>Condition</th>     </tr>     <tr>         <td class=\"center\">1</td>         <td>Fournaise insoutenable</td>     </tr>     <tr>         <td class=\"center\">2</td>         <td>Chaud</td>     </tr>     <tr>         <td class=\"center\">3</td>         <td>Doux</td>     </tr>     <tr>         <td class=\"center\">4</td>         <td>Frais</td>     </tr>     <tr>         <td class=\"center\">5</td>         <td>Froid</td>     </tr>     <tr>         <td class=\"center\">6</td>         <td>Froid arctique</td>     </tr> </tbody></table> <br><strong>Vent</strong> <br> <table>     <tbody><tr>         <th class=\"center\">État</th>         <th>Condition</th>     </tr>     <tr>         <td class=\"center\">1</td>         <td>Calme</td>     </tr>     <tr>         <td class=\"center\">2</td>         <td>Vent modéré</td>     </tr>     <tr>         <td class=\"center\">3</td>         <td>Vent fort</td>     </tr>     <tr>         <td class=\"center\">4</td>         <td>Vent violent</td>     </tr>     <tr>         <td class=\"center\">5</td>         <td>Ouragan</td>     </tr> </tbody></table> <br>"
	},
	{
		name: "Création de mort-vivant",
		originalName: "Create Undead",
		castedBy: [
			"cleric",
			"warlock",
			"wizard"
		],
		id: "6b1783f5-5866-47e1-8e67-4f391677cb98",
		level: 6,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 minute",
		range: "3 mètres",
		components: "V, S, M (un pot d'argile rempli de terre prélevée sur une tombe, un pot d'argile rempli d'eau croupie, et une pierre d'onyx noire valant au moins 150 po pour chaque cadavre)",
		duration: "instantanée",
		description: "Vous ne pouvez lancer ce sort que durant la nuit. Choisissez jusqu'à trois cadavres d'humanoïdes de taille M ou P à portée. Chaque cadavre devient une goule sous votre contrôle (le MD possède les statistiques de ces créatures). <br>Par une action bonus, à chacun de vos tours, vous pouvez mentalement donner des ordres à toute créature que vous avez animée avec ce sort, si elle se trouve à 36 mètres ou moins de vous (si vous contrôlez de nombreuses créatures, vous pouvez donner vos ordres à plusieurs d'entre elles, voire à toutes, en même temps, à la condition qu'elles reçoivent toutes le même ordre). Vous décidez quelle action la créature va effectuer et où elle va se déplacer au cours de son prochain tour, ou bien vous pouvez lui donner un ordre général, comme garder une chambre ou un couloir. Si vous ne donnez aucun ordre, la créature ne fait que se défendre contre les créatures hostiles. Une fois que vous avez donné votre ordre, la créature continue de le suivre jusqu'à ce que sa tâche soit accomplie. <br>La créature est sous votre contrôle pour 24 heures. Passé ce délai, elle cesse d'obéir aux ordres que vous lui avez donnés. Pour conserver votre contrôle sur la créature pour 24 heures supplémentaires, vous devez lancer ce sort sur la créature avant que la première période de 24 heures ne se termine. Cette utilisation de ce sort réaffirme votre contrôle sur trois créatures que vous avez déjà animées, plutôt que d'en animer de nouvelles. ",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 7, vous pouvez animer ou réaffirmer votre contrôle sur quatre goules. Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 8, vous pouvez animer ou réaffirmer votre contrôle sur cinq goules ou deux blêmes ou deux nécrophages. Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 9, vous pouvez animer ou réaffirmer votre contrôle sur six goules ou trois blêmes ou trois nécrophages ou deux momies. <br>"
	},
	{
		name: "Création ou destruction d'eau",
		originalName: "Create or Destroy Water",
		castedBy: [
			"cleric",
			"druid"
		],
		id: "4e90474a-229a-4e38-8ee8-4e93e265928b",
		level: 1,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (une goutte d'eau pour la création d'eau ou quelques grains de sable pour la destruction d'eau)",
		duration: "instantanée",
		description: "Soit vous créez, soit vous détruisez de l'eau. <br><strong><em>Création d'eau</em></strong>. Vous créez jusqu'à 40 litres d'eau pure dans un contenant ouvert à portée. Vous pouvez sinon choisir de faire tomber l'eau sous forme de pluie dans un cube de 9 mètres d'arête à portée, éteignant ainsi les flammes non protégées de la zone. <br><strong><em>Destruction d'eau</em></strong>. Vous détruisez jusqu'à 40 litres d'eau présente dans un contenant ouvert à portée. Sinon, vous pouvez choisir de supprimer le brouillard dans un cube de 9 mètres d'arête à portée. ",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, vous créez ou détruisez 40 litres d'eau supplémentaires, ou augmentez la taille du cube de 1,50 mètre d'arête, pour chaque niveau d'emplacement au-delà du niveau 1. <br>"
	},
	{
		name: "Délivrance des malédictions",
		originalName: "Remove Curse",
		castedBy: [
			"cleric",
			"paladin",
			"warlock",
			"wizard"
		],
		id: "8910c477-c110-45a5-a901-3c35a1e55fcd",
		level: 3,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "instantanée",
		description: "Au contact, toutes les malédictions affligeant une créature ou un objet prennent fin. Si l'objet est un objet magique maudit, la malédiction persiste, mais le sort met un terme au lien entre le propriétaire et l'objet de sorte qu'il peut être retiré ou qu'il peut s'en débarrasser. <br>"
	},
	{
		name: "Détection du mal et du bien",
		originalName: "Detect Evil and Good",
		castedBy: [
			"cleric",
			"paladin"
		],
		id: "0744b71e-e84c-45c2-9f8f-c738f5cb3a6d",
		level: 1,
		school: "divination",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Pour la durée du sort, vous savez si une aberration, un céleste, un élémentaire, une fée, un fiélon ou un mort-vivant est présent dans un rayon de 9 mètres autour de vous. Vous pouvez aussi déterminer sa localisation. De la même manière, vous savez si un objet ou un lieu à 9 mètres ou moins de vous a été consacré ou profané. <br>Le sort peut outrepasser la plupart des obstacles mais il est bloqué par 30 cm de pierre, 2,50 cm de métal ordinaire, une mince feuille de plomb ou 90 cm de bois ou de terre. <br>"
	},
	{
		name: "Détection du poison et des maladies",
		originalName: "Detect Poison and Disease",
		castedBy: [
			"cleric",
			"druid",
			"paladin",
			"ranger"
		],
		id: "ea605429-850f-4b47-a416-f81b310caa8b",
		level: 1,
		school: "divination",
		isRitual: true,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (une feuille d'if)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Pour la durée du sort, vous pouvez percevoir la présence et localiser les poisons, les créatures venimeuses, et les maladies dans un rayon de 9 mètres autour de vous. Vous identifiez également le type de poison, de créature venimeuse, ou de maladie. <br>Le sort peut outrepasser la plupart des obstacles mais il est bloqué par 30 cm de pierre, 2,50 cm de métal ordinaire, une mince feuille de plomb ou 90 cm de bois ou de terre. <br>"
	},
	{
		name: "Dissipation du mal et du bien",
		originalName: "Dispel Evil and Good",
		castedBy: [
			"cleric",
			"paladin"
		],
		id: "9cfe4343-9cbc-4eed-97d3-a94f9554ccba",
		level: 5,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (de l'eau bénite ou de la poudre de fer et d'argent)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Une énergie chatoyante vous enveloppe et vous protège des fées, des morts-vivants et des créatures originaires d'autres plans que le plan matériel. Pour la durée du sort, les célestes, élémentaires, fées, fiélons et morts-vivants ont un désavantage aux jets d'attaque contre vous. <br>Vous pouvez mettre fin prématurément au sort en utilisant l'une ou l'autre des options suivantes. <br><strong>Annulation d'enchantement</strong>. Par une action, vous touchez une créature à portée qui est charmée, effrayée ou possédée par un céleste, un élémentaire, une fée, un fiélon ou un mort-vivant. La créature que vous touchez cesse immédiatement d'être charmée, effrayé ou possédée par de telles créatures. <br><strong>Renvoi</strong>. Par une action, effectuez une attaque au corps à corps avec un sort contre un céleste, un élémentaire, une fée, un fiélon ou un mort-vivant à portée. Si votre attaque touche, vous tentez de renvoyer cette créature sur son plan d'origine. La créature doit réussir un jet de sauvegarde de Charisme sous peine d'être envoyée sur son plan natif (si elle ne s'y trouve pas actuellement). S'ils ne sont pas sur leur plan natif, les morts-vivants sont envoyés dans la Gisombre et les fées dans la Féerie. <br>"
	},
	{
		name: "Divination",
		originalName: "Divination",
		castedBy: [
			"cleric"
		],
		id: "2db1cbfc-9d0a-40e4-af0d-b44504753c61",
		level: 4,
		school: "divination",
		isRitual: true,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (de l'encens et une offrande sacrificielle appropriée à votre religion, valant au moins 25 po, que le sort consomme)",
		duration: "instantanée",
		description: "Votre magie accompagnée d'une offrande vous met en contact avec votre dieu ou un de ses serviteurs. Vous posez une seule question en vue d'un objectif, d'un événement ou d'une activité spécifique qui pourrait se produire dans les 7 jours. Le MD donne une réponse véridique. La réponse peut prendre la forme d'une courte phrase, d'un vers cryptique ou d'un présage. <br>Le sort ne considère pas les circonstances qui pourraient changer l'issue de la divination, comme l'incantation additionnelle de sorts ou la perte ou le gain d'un nouveau compagnon. <br>Si vous incantez le sort plus d'une fois avant la fin de votre prochain repos long, il y a une probabilité cumulative de 25 % de recevoir une réponse aléatoire, et ce, pour chaque incantation après la première. Le MD fait ce jet en secret. <br>"
	},
	{
		name: "Éclair traçant",
		originalName: "Guiding Bolt Rayon traçant",
		castedBy: [
			"cleric"
		],
		id: "a57e8795-a37d-47fc-a888-287756ae408f",
		level: 1,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "1 round",
		description: "Un éclair silencieux fonce sur une créature de votre choix dans la portée du sort. Faites une attaque à distance avec un sort contre la cible. Si elle réussit, la cible subit 4d6 dégâts radiants et le prochain jet d'attaque effectué contre cette cible avant la fin du votre prochain tour bénéficie d'un avantage grâce à la lumière faible mystique qui illumine alors la cible. ",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts infligés augmentent de 1d6 pour chaque niveau d'emplacement au-delà du niveau 1. <br>"
	},
	{
		name: "Esprits gardiens",
		originalName: "Spirit Guardians",
		castedBy: [
			"cleric"
		],
		id: "de1d7b5d-352b-4f5d-bffb-353ec318b66d",
		level: 3,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (rayon de 4,50 mètres)",
		components: "V, S, M (un symbole sacré)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous appelez des esprits pour vous protéger. Ils volent dans un rayon de 4,50 mètres autour de vous pendant pour la durée du sort. Si vous êtes bon ou neutre, leur forme spectrale semble angélique ou féerique (à votre choix). Si vous êtes mauvais, ils apparaissent diaboliques ou démoniaques. <br>Lorsque vous lancez ce sort, vous pouvez désigner des créatures que vous pouvez voir pour qu'elles ne soient pas affectées. La vitesse d'une créature affectée est réduite de moitié dans la zone d'effet, et quand la créature entre dans la zone pour la première fois pendant un tour ou commence son tour dans celle-ci, elle doit effectuer un jet de sauvegarde de Sagesse. En cas d'échec, la créature prend 3d8 dégâts radiants (si vous êtes bon ou neutre) ou 3d8 dégâts nécrotiques (si vous êtes mauvais). En cas de réussite, la créature prend la moitié de ces dégâts. ",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, les dégâts augmentent de 1d8 pour chaque niveau d'emplacement au-delà du niveau 3. <br>"
	},
	{
		name: "Festin des héros",
		originalName: "Heroes' Feast",
		castedBy: [
			"cleric",
			"druid"
		],
		id: "f6f9b2a0-f4d4-4655-98be-3ad348023bcf",
		level: 6,
		school: "conjuration",
		isRitual: false,
		castingTime: "10 minutes",
		range: "9 mètres",
		components: "V, S, M (un bol incrusté de joyaux valant au moins 1 000 po, que le sort consomme)",
		duration: "instantanée",
		description: "Vous produisez un grand festin, incluant des breuvages et des mets magnifiques. Le festin prend 1 heure pour être consommé et disparaît au bout de cette période. C'est à ce moment que les effets bénéfiques s'appliquent. Jusqu'à douze convives peuvent prendre part au festin. <br>Une créature qui partage le festin reçoit de nombreux bénéfices. La créature est guérie des maladies et des empoisonnements. Elle devient immunisée aux poisons, ne peut être effrayée et tous ses jets de sauvegarde de Sagesse ont un avantage. Son maximum de points de vie est aussi augmenté de 2d10 et elle gagne la même quantité de points de vie. Ces bénéfices persistent pendant 24 heures. <br>"
	},
	{
		name: "Flamme sacrée",
		originalName: "Sacred Flame",
		castedBy: [
			"cleric"
		],
		id: "658800c3-0a2a-4f18-92c3-98d99238888a",
		level: 0,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Un rayonnement semblable à des flammes descend sur une créature que vous pouvez voir dans la portée du sort. La cible doit réussir un jet de sauvegarde de Dextérité ou subir 1d8 dégâts radiants. La cible ne gagne aucun bénéfice d'abri pour ce jet de sauvegarde. <br>Les dégâts du sort augmentent de 1d8 lorsque vous atteignez le niveau 5 (2d8), le niveau 11 (3d8), et le niveau 17 (4d8). <br>"
	},
	{
		name: "Fléau d'insectes",
		originalName: "Insect Plague",
		castedBy: [
			"cleric",
			"druid",
			"sorcerer"
		],
		id: "518e9fa9-f73b-4784-ac88-6feb5471cbae",
		level: 5,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "90 mètres",
		components: "V, S, M (quelques cristaux de sucre, quelques grains de céréale et un peu de graisse)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Une nuée de criquets bourdonnants occupent une sphère de 6 mètres de rayon centrée sur un point dans la portée du sort. La sphère s'étend au-delà des coins. La sphère persiste pour la durée du sort et la visibilité dans la zone est réduite. L'espace de la sphère est un terrain difficile. <br>Lorsque la sphère apparait, chaque créature s'y trouvant doit effectuer un jet de sauvegarde de Constitution, subissant 4d10 dégâts perforants en cas d'échec, ou la moitié de ces dégâts en cas de réussite. Une créature doit aussi effectuer ce jet de sauvegarde lorsqu'elle pénètre dans l'espace du sort pour la première lors d'un tour ou lorsqu'elle y termine son tour. ",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 6 ou supérieur, les dégâts augmentent de 1d10 pour chaque niveau d'emplacement au-delà du niveau 5. <br>"
	},
	{
		name: "Fusion dans la pierre",
		originalName: "Meld into Stone",
		castedBy: [
			"cleric",
			"druid"
		],
		id: "a28c90de-c78f-4324-9a5d-5c6b109f14d6",
		level: 3,
		school: "transmutation",
		isRitual: true,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "8 heures",
		description: "Vous pénétrez dans un objet en pierre ou une surface suffisamment large pour contenir totalement votre corps, vous fusionnant ainsi que tout l'équipement que vous portez avec la pierre pour la durée du sort. En utilisant votre mouvement, vous pénétrez dans la pierre à l'endroit que vous pouvez toucher. Votre présence n'est en aucun cas visible ou détectable par des sens non magiques. <br>Tant que vous êtes fusionné avec la pierre, vous ne pouvez pas voir ce qui se passe au dehors et avez un désavantage à tous les jets de Sagesse (Perception) que vous effectuez pour entendre des sons produits à l'extérieur. Vous êtes conscient de l'écoulement du temps et pouvez lancer des sorts sur vous-même alors que vous êtes fusionné dans la pierre. Vous pouvez utiliser votre mouvement pour quitter la pierre par l'endroit où vous y êtes entré, ce qui met un terme au sort. Vous ne pouvez pas vous déplacer autrement. <br>De petits dégâts physiques sur la pierre ne vous affectent pas, mais sa destruction partielle ou un changement de sa forme (à la condition que vous ne puissiez plus être contenu dedans) vous expulse de la pierre et vous inflige 6d6 dégâts contondants. La destruction complète de la pierre (ou sa transmutation en une autre matière) vous expulse et vous inflige 50 dégâts contondants. Si vous êtes expulsé, vous tombez à terre dans l'espace inoccupé le plus proche de votre point de fusion dans la pierre. <br>"
	},
	{
		name: "Gardien de la foi",
		originalName: "Guardian of Faith",
		castedBy: [
			"cleric"
		],
		id: "b4743128-dc4d-48f5-a590-ee4bd5b2d5a0",
		level: 4,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V",
		duration: "8 heures",
		description: "Un gardien spectral de taille G apparait et flotte au-dessus d'un espace de votre choix, inoccupé et visible, dans la portée et pour la durée du sort. Le gardien occupe cet espace et il est flou à l'exception d'une épée étincelante et d'un bouclier montrant le symbole de votre divinité. <br>Toute créature vous étant hostile qui se déplace pour la première fois lors de son tour dans un espace à 3 mètres ou moins du gardien doit effectuer un jet de sauvegarde de Dextérité, subissant 20 dégâts radiants en cas d'échec, ou la moitié de ces dégâts en cas de réussite. Le gardien se volatilise après avoir infligé un total de 60 dégâts. <br>"
	},
	{
		name: "Guérison",
		originalName: "Heal",
		castedBy: [
			"cleric",
			"druid"
		],
		id: "d80fd862-01fa-4aec-a0fe-3b7d94327792",
		level: 6,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Choisissez une créature que vous voyez dans la portée du sort. Une décharge d'énergie positive engouffre la créature lui permettant de récupérer 70 points de vie. Ce sort met aussi un terme à un aveuglement, une surdité et toutes autres maladies accablant la cible. Ce sort n'a pas d'effet sur les morts-vivants et les artificiels. ",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 7 ou supérieur, la quantité de points de vie récupérés est augmentée de 10 pour chaque niveau d'emplacement au-delà du niveau 6. <br>"
	},
	{
		name: "Guérison de groupe",
		originalName: "Mass Heal",
		castedBy: [
			"cleric"
		],
		id: "96c2a379-355c-4f07-bd53-609529c18e43",
		level: 9,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Un flot d'énergie curative émane de votre personne vers les créatures blessées qui vous entourent. Vous redonnez jusqu'à 700 points de vie, répartis à votre guise entre les créatures de votre choix qui sont visibles dans la portée du sort. Les créatures soignées par ce sort sont aussi guéries de toutes maladies et des effets qui les rendent sourds ou aveugles. Ce sort n'a pas d'effet sur les morts-vivants et les artificiels. <br>"
	},
	{
		name: "Injonction",
		originalName: "Command",
		castedBy: [
			"cleric",
			"paladin"
		],
		id: "0524bf62-dc3f-45f6-9ce1-d74ac84046ed",
		level: 1,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V",
		duration: "1 round",
		description: "Vous donnez un ordre d'un mot à une créature dans la portée du sort et que vous pouvez voir. La cible doit réussir un jet de sauvegarde de Sagesse ou suivre l'ordre lors de son prochain tour. Le sort n'a aucun effet si la cible est un mort-vivant, si elle ne comprend pas la langue, ou si votre ordre est directement nocif pour elle. <br>Des injonctions typiques et leurs effets suivent. Vous pouvez émettre un ordre autre que ceux décrits ici. Si vous le faites, le MD détermine comment la cible se comporte. Si la cible est empêchée de suivre votre ordre, le sort prend fin. <br><strong><em>Approche</em></strong>. La cible se déplace vers vous par le chemin le plus court et le plus direct, terminant son tour si elle arrive à 1,50 mètre ou moins de vous. <br><strong><em>Lâche</em></strong>. La cible lâche tout ce qu'elle tient et termine alors à son tour. <br><strong><em>Fuis</em></strong>. La cible s'éloigne de vous le plus rapidement possible. <br><strong><em>Tombe</em></strong>. La cible tombe au sol et termine alors à son tour. <br><strong><em>Halte</em></strong>. La cible ne bouge plus et n'entreprend aucune action. ",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, vous pouvez affecter une créature supplémentaire pour chaque niveau d'emplacement au-delà du niveau 1. Les créatures que vous ciblez doivent toutes être dans un rayon de 9 mètres. <br>"
	},
	{
		name: "Interdiction",
		originalName: "Forbiddance",
		castedBy: [
			"cleric"
		],
		id: "d49ba3fd-852d-479c-8d97-dc410fc160db",
		level: 6,
		school: "abjuration",
		isRitual: true,
		castingTime: "10 minutes",
		range: "contact",
		components: "V, S, M (quelques gouttes d'eau bénite, des encens très rares, et de la poudre de rubis pour une valeur minimum de 1 000 po)",
		duration: "1 jour",
		description: "Vous créez une défense contre les déplacements magiques qui protège jusqu'à 4,500 mètres carré d'espace au sol sur une hauteur de 9 mètres au-dessus du sol. Pour la durée du sort, les créatures ne peuvent pas se téléporter dans cette zone en utilisant des portails, comme ceux créés par le sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=portail\">portail</a></em>, pour pénétrer la zone. Le sort imperméabilise la zone aux voyages planaires, et pour cela, empêche les créatures d'accéder à la zone en passant par le plan Astral, le plan éthéré, la Féerie et la Gisombre, ou grâce au sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=changement-de-plan\">changement de plan</a></em>. <br>De plus, le sort inflige des dégâts aux créatures des types que vous choisissez lorsque vous lancez ce sort. Choisissez un ou plus des types suivants : céleste, élémentaire, fée, fiélon, et mort-vivant. Lorsqu'une créature du type choisi pénètre dans l'aire du sort pour la première fois de son tour, ou y commence son tour, la créature subit 5d10 dégâts radiants ou nécrotiques (choix que vous avez effectué lors de l'incantation du sort). <br>Lorsque vous lancez ce sort, vous pouvez désigner un mot de passe. Une créature qui prononce le mot de passe au moment où elle pénètre dans la zone ne subit pas les dégâts du sort. <br>La zone affectée par ce sort ne peut pas se superposer à une zone créée par un autre sort d'<em>interdiction</em>. Si vous lancez <em>interdiction</em> chaque jour pendant 30 jours sur la même zone, le sort durera jusqu'à ce qu'il soit dissipé et les composantes matérielles seront consommées lors de la dernière incantation. <br>"
	},
	{
		name: "Invocation de céleste",
		originalName: "Conjure Celestial",
		castedBy: [
			"cleric"
		],
		id: "87561667-ddf9-45d0-8aa1-f2585c125e17",
		level: 7,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 minute",
		range: "27 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous invoquez un céleste de FP 4 ou inférieur, qui apparaît dans un espace inoccupé que vous pouvez voir et à portée. Le céleste disparaît lorsqu'il tombe à 0 point de vie ou lorsque le sort prend fin. <br>Le céleste a une attitude amicale envers vous et vos compagnons pour la durée du sort. Lancez l'initiative pour le céleste ; il a ses propres tours de jeu. Il obéit aux ordres verbaux que vous lui donnez (aucune action n'est requise de votre part), tant qu'elles ne sont pas en contradiction avec son alignement. Si vous ne lui donnez aucun ordre, le céleste ne fait que se défendre contre les créatures qui lui sont hostiles. Le MD possède les statistiques du céleste. ",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 9, vous invoquez un céleste de FP 5 ou inférieur. <br>"
	},
	{
		name: "Lien de protection",
		originalName: "Warding Bond",
		castedBy: [
			"cleric"
		],
		id: "0c3f428a-153d-43ff-af4d-12f613fca933",
		level: 2,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (une paire d'anneaux de platine d'une valeur d'au moins 50 po chacun, que vous et la cible devez porter durant la durée du sort)",
		duration: "1 heure",
		description: "Ce sort protège une créature consentante que vous touchez et crée une connexion mystique entre vous et la cible jusqu'à ce que le sort se termine. Aussi longtemps que la cible n'est pas éloignée de plus de 18 mètres de vous, elle gagne un bonus de +1 à la CA, +1 aux jets de sauvegarde et obtient une résistance à tous les dégâts. De plus, chaque fois qu'elle subit des dégâts, vous recevez la même quantité de dégâts. <br>Le sort se termine si vous tombez à 0 point de vie ou si vous et la cible êtes séparés de plus de 18 mètres de distance. Le sort prend également fin s'il est lancé à nouveau sur l'une des créatures connectées. Vous pouvez également rompre le sort au prix d'une action. <br>"
	},
	{
		name: "Lueur d'espoir",
		originalName: "Beacon of Hope",
		castedBy: [
			"cleric"
		],
		id: "577a7d08-8104-4ac4-ba06-f25450a32b76",
		level: 3,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Ce sort confère espoir et vitalité. Choisissez des créatures dans la portée du sort. Pour la durée du sort, chaque cible bénéficie d'un avantage à ses jets de sauvegarde de Sagesse et à ses jets de sauvegarde contre la mort. Elle récupère aussi le maximum de points de vie lors d'une guérison. <br>"
	},
	{
		name: "Lumière du jour",
		originalName: "Daylight",
		castedBy: [
			"cleric",
			"druid",
			"paladin",
			"ranger",
			"sorcerer"
		],
		id: "2f67d820-0438-4a9d-8cb9-b3330cf4f39c",
		level: 3,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "1 heure",
		description: "Une sphère de lumière de 18 mètres de rayon jaillit d'un point choisi dans la portée du sort. La sphère est composée de lumière vive et elle émet une lumière faible sur 18 mètres supplémentaires. <br>Si vous choisissez un point sur un objet que vous tenez ou sur un objet qui n'est pas porté ou transporté, la lumière émane de cet objet et se déplace avec lui. En recouvrant complètement l'objet affecté avec un objet opaque, comme un bol ou un casque, la lumière est bloquée. <br>Si une portion de la zone du sort chevauche une zone de ténèbres créée par un sort de niveau 3 ou moindre, le sort qui génère les ténèbres est dissipé. <br>"
	},
	{
		name: "Mot de guérison de groupe",
		originalName: "Mass Healing Word",
		castedBy: [
			"cleric"
		],
		id: "c017b70a-7f9f-420c-955a-d29116d35602",
		level: 3,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "18 mètres",
		components: "V",
		duration: "instantanée",
		description: "À mesure que vous évoquez des paroles de rétablissement, jusqu'à six créatures visibles de votre choix récupèrent un nombre de points de vie égal à 1d4 + le modificateur de votre caractéristique d'incantation. Ce sort n'a pas d'effet sur les morts-vivants et les artificiels. ",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, les points de vie récupérés augmentent de 1d4 pour chaque niveau d'emplacement au-delà du niveau 3. <br>"
	},
	{
		name: "Mot de retour",
		originalName: "Word of Recall",
		castedBy: [
			"cleric"
		],
		id: "46a0d0a0-48bb-4428-875a-7c31abb992cd",
		level: 6,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "1,50 mètre",
		components: "V",
		duration: "instantanée",
		description: "Vous, et jusqu'à cinq créatures consentantes se trouvant à 1,50 mètre de vous, êtes instantanément téléportés dans un sanctuaire préalablement choisi. Vous, et toutes les créatures téléportées avec vous, apparaissez à l'endroit inoccupé le plus proche de lieu que vous avez choisi lorsque vous avez préparé votre sanctuaire (voir ci-dessous). Si vous lancez ce sort sans avoir au préalable préparer un sanctuaire, le sort n'a aucun effet. <br>Vous devez désigner un sanctuaire en lançant ce sort dans un lieu, comme un temple, dédié, ou puissamment connecté, à votre dieu. Si vous tentez de lancer ce sort de cette manière dans une zone qui n'est pas dédiée à votre dieu, le sort n'a aucun effet. <br>"
	},
	{
		name: "Parole divine",
		originalName: "Divine Word",
		castedBy: [
			"cleric"
		],
		id: "aae5bec7-457d-4ee7-8fbd-f165603bf66c",
		level: 7,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "9 mètres",
		components: "V",
		duration: "instantanée",
		description: "Vous prononcez une parole divine, emplie de la puissance qui a façonné le monde à l'aube de la création. Choisissez autant de créatures que vous le souhaitez parmi celles que vous voyez, dans la portée du sort. Chaque créature qui vous entend doit réussir un jet de sauvegarde de Charisme ou subir un effet selon la valeur actuelle de ses points de vie. <br>• 50 pv ou moins : assourdie pendant 1 minute <br>• 40 pv ou moins : assourdie et aveuglée pendant 10 minutes <br>• 30 pv ou moins : aveuglée, assourdie et étourdie pendant 1 heure <br>• 20 pv ou moins : tuée sur le coup <br>Indépendamment de ses points de vie actuels, un céleste, un élémentaire, une fée ou un fiélon qui échoue son jet est retourné à son plan d'origine (s'il n'y est pas déjà) et il ne peut revenir sur votre plan pendant 24 heures, peu importe le moyen, à l'exception du sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=souhait\">souhait</a></em>. <br>"
	},
	{
		name: "Portail",
		originalName: "Gate",
		castedBy: [
			"cleric",
			"sorcerer",
			"wizard"
		],
		id: "9577109c-f3b6-4abd-bc33-3bdf1b034bbd",
		level: 9,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (un diamant valant au moins 5000 po)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous invoquez un portail reliant un espace inoccupé que vous voyez dans la portée du sort à un endroit précis sur un plan d'existence différent. Le portail se présente comme une ouverture circulaire, dont vous contrôlez le diamètre, entre 1,50 et 6 mètres. Vous pouvez orienter le portail dans n'importe quelle direction. Le portail persiste selon la durée du sort. <br>Le portail possède un avant et un arrière sur chaque plan où il apparait. Le passage dans le portail n'est possible qu'en pénétrant par l'avant. Tout ce qui traverse est instantanément transporté sur l'autre plan pour apparaître dans l'espace inoccupé le plus près du portail. <br>Les divinités et autres dirigeants planaires peuvent empêcher l'ouverture d'un portail créé par ce sort lorsqu'elle se fait en leur présence ou à tout endroit sur leurs domaines. <br>Lorsque vous lancez ce sort, vous pouvez énoncer le nom d'une créature spécifique (un pseudonyme, un titre ou un surnom ne suffit pas). Si cette créature est sur un plan différent du vôtre, le portail s'ouvre à proximité de la créature nommée, laquelle est aussitôt aspirée par le portail pour apparaître dans un espace inoccupé de votre côté du portail. Vous ne bénéficiez d'aucun pouvoir spécial sur la créature et elle libre d'agir selon la volonté du MD. Elle peut partir, vous attaquer ou vous aider. <br>"
	},
	{
		name: "Préservation des morts",
		originalName: "Gentle Repose Doux repos",
		castedBy: [
			"cleric",
			"wizard"
		],
		id: "bd82a184-296d-4bb5-8074-5be578d768ed",
		level: 2,
		school: "necromancy",
		isRitual: true,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (une pincée de sel, et une pièce de cuivre pour chaque œil du corps à préserver. Les pièces doivent rester en place pour la durée du sort)",
		duration: "10 jours",
		description: "Vous touchez un corps ou ce qu'il en reste. Pour la durée du sort, la cible est protégée du pourrissement et ne peut pas devenir un mort-vivant. <br>Le sort augmente également la durée limite au-delà de laquelle il n'est plus possible de ramener un corps à la vie. Les jours passés sous l'influence de ce sort ne comptent pas dans le total de jours passés à l'état de cadavre pour des sorts comme <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=rappel-a-la-vie\">rappel à la vie</a></em>. <br>"
	},
	{
		name: "Prière de guérison",
		originalName: "Prayer of Healing",
		castedBy: [
			"cleric"
		],
		id: "d449fba0-6c5a-486d-962e-806319bbcc91",
		level: 2,
		school: "evocation",
		isRitual: false,
		castingTime: "10 minutes",
		range: "9 mètres",
		components: "V",
		duration: "instantanée",
		description: "Jusqu'à six créatures de votre choix visibles dans la portée du sort récupèrent chacune des points de vie équivalant à 2d8 + le modificateur de votre caractéristique d'incantation. Ce sort n'a pas d'effet sur les morts-vivants et les artificiels. ",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, les points de vie récupérés augmentent de 1d8 pour chaque niveau d'emplacement au-delà du niveau 2. <br>"
	},
	{
		name: "Projection astrale",
		originalName: "Astral Projection",
		castedBy: [
			"cleric",
			"warlock",
			"wizard"
		],
		id: "ac076dd0-c406-4721-9ab6-7876407534b4",
		level: 9,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 heure",
		range: "3 mètres",
		components: "V, S, M (pour chaque créature que vous ciblez avec ce sort, vous devez fournir une jacinthe valant au moins 1 000 po et un lingot d'argent ornementé de gravures valant au moins 100 po, que le sort consomme)",
		duration: "spéciale",
		description: "Vous et jusqu'à huit créatures consentantes dans la portée du sort projetez vos corps astraux dans le plan Astral (le sort échoue et l'incantation est perdue si vous êtes déjà sur ce plan). Les corps matériels laissés derrière sont inconscients et dans un état d'animation suspendue. Ils ne requièrent ni sustentation ni air et ils ne vieillissent pas. <br>Votre corps astral est similaire à votre forme mortelle à presque tous les égards. Vos possessions et vos statistiques de jeu sont ainsi répliquées. La principale différence est l'ajout d'un cordon argenté qui prend son origine entre vos omoplates et qui traine derrière vous, pour disparaitre après 30 cm. Ce cordon est votre attache avec votre corps matériel. Aussi longtemps que l'attache demeure intacte, vous pouvez retourner sur votre plan. Si le cordon est tranché, un incident qui ne survient que si un effet spécifie que c'est le cas, votre âme et votre corps sont séparés, vous tuant sur le coup. <br>Votre forme astrale peut se déplacer librement à travers le plan Astral et elle peut emprunter des portails vous menant sur tout autre plan. Si vous entrez sur un nouveau plan ou si vous retournez sur le plan d'où le sort fut incanté, votre corps et vos possessions sont transportés le long du cordon argenté, vous permettant de reprendre votre forme matérielle lors de votre arrivée sur le nouveau plan. Votre forme astrale est une incarnation distincte. Les dégâts ou les effets qu'elle subit n'ont pas d'impact sur votre corps physique et ils ne l'affectent pas lorsque vous y retournez. <br>Le sort prend fin pour vous et vos compagnons lorsque vous utilisez une action pour le dissiper. Lorsque le sort se termine, les créatures ciblées retournent à leur corps physique puis elles reprennent conscience. <br>Le sort peut aussi se terminer prématurément pour vous ou un de vos compagnons. Une <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=dissipation-de-la-magie\">dissipation de la magie</a></em> réussie sur un corps astral ou physique interrompt le sort pour cette créature. Si le corps d'origine ou sa forme astrale tombe à 0 point de vie, le sort s'interrompt pour cette créature. Si le sort se termine et que le cordon argenté est toujours intact, le cordon ramène la forme astrale de la créature à son corps, ce qui met un terme à l'état d'animation suspendue. <br>Si vous êtes retourné à votre corps prématurément, vos compagnons conservent leur forme astrale et ils doivent trouver eux-mêmes le chemin du retour, en tombant à 0 point de vie, habituellement. <br>"
	},
	{
		name: "Protection contre la mort",
		originalName: "Death Ward",
		castedBy: [
			"cleric",
			"paladin"
		],
		id: "d7845f40-83b6-4822-a2cb-b6de14b87db6",
		level: 4,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S",
		duration: "8 heures",
		description: "Vous touchez une créature et vous lui octroyez une mesure de protection contre la mort. <br>La première fois que la cible atteint 0 point de vie à cause de dégâts reçus, la cible passe à 1 point de vie et le sort prend fin. <br>Si le sort est toujours actif lorsque la cible est victime d'un effet qui la tuerait instantanément sans causer de dégât, cet effet est nul pour la cible, et le sort prend fin. <br>"
	},
	{
		name: "Protection contre le mal et le bien",
		originalName: "Protection from Evil and Good",
		castedBy: [
			"cleric",
			"paladin",
			"warlock",
			"wizard"
		],
		id: "3a8295c0-b62a-45d2-aa37-0f40f213283c",
		level: 1,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (de l'eau bénite ou de la poudre d'argent et de fer, que le sort consomme)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Jusqu'à ce que le sort prenne fin, une créature consentante que vous touchez est protégée contre certains types de créatures : les aberrations, les célestes, les élémentaires, les fées, les fiélons et les morts-vivants. <br>La protection confère un certain nombre de bénéfices. Les créatures de ces types ont un désavantage à leurs jets d'attaque effectués contre la cible. De plus, elles ne peuvent ni effrayer, ni charmer, ni posséder la cible. Si la cible est déjà charmée, effrayée, ou possédée par une telle créature, la cible a un avantage à tout nouveau jet de sauvegarde qu'elle effectuerait contre l'effet en question. <br>"
	},
	{
		name: "Résurrection suprême",
		originalName: "True Resurrection",
		castedBy: [
			"cleric",
			"druid"
		],
		id: "8de1ffe1-182f-48ff-8a28-76b5cf9b442b",
		level: 9,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 heure",
		range: "contact",
		components: "V, S, M (une aspersion d'eau bénite et des diamants d'une valeur d'au moins 25 000 po, que le sort consomme)",
		duration: "instantanée",
		description: "Vous touchez une créature qui est morte depuis moins de 200 ans mais qui n'est pas morte de vieillesse. Si l'âme de la créature est libre et consentante, la créature est ramenée à la vie avec tous ses points de vie. <br>Ce sort referme toutes les blessures, neutralise tout poison, guérit toutes les maladies et lève toutes les malédictions affectant la créature lorsqu'elle est morte. Le sort remplace les organes endommagés ou les membres manquants. Si la créature était un mort-vivant, elle revient sous la forme qu'elle avait avant de devenir un mort-vivant. <br>Le sort peut même fournir un nouveau corps si l'original n'existe plus. Dans ce cas, vous devez prononcer le nom de la créature et la créature apparaît alors dans un espace inoccupé que vous choisissez à 3 mètres ou moins de vous. <br>"
	},
	{
		name: "Sanctification",
		originalName: "Hallow",
		castedBy: [
			"cleric"
		],
		id: "17886dd1-915a-4080-b81d-1df6de1e8b27",
		level: 5,
		school: "evocation",
		isRitual: false,
		castingTime: "24 heures",
		range: "contact",
		components: "V, S, M (des herbes, des huiles et de l'encens d'une valeur d'au moins 1 000 po, que le sort consomme)",
		duration: "jusqu'à dissipation",
		description: "Vous touchez un point et imprégnez la zone autour d'une énergie sacrée (ou maudite). La zone peut avoir un rayon allant jusqu'à 18 mètres, et le sort échoue si le rayon inclut une zone déjà sous l'effet d'un sort de <em>sanctification</em>. La zone affectée est sujette aux effets suivants. <br>Premièrement, les célestes, les élémentaires, les fées, les fiélons et les morts-vivants ne peuvent pas entrer dans la zone, elles ne peuvent pas non plus charmer, effrayer ou posséder des créatures présentes dans la zone sanctifiée. Vous pouvez enlever de cette liste un ou plusieurs types de créatures (sur lesquelles l'effet ne s'appliquera donc pas). <br>Deuxièmement, vous pouvez apposer un effet supplémentaire à la zone. Choisissez l'effet parmi la liste suivante, ou choisissez un effet proposé par le MD. Certains de ces effets s'appliquent à des créatures dans la zone ; vous pouvez choisir si l'effet s'applique à toutes les créatures dans la zone, seulement aux créatures qui vénèrent un certain dieu ou suivent un chef particulier, ou seulement aux créatures d'une certaine sorte, comme les orcs ou les trolls. Lorsqu'une créature qui devrait être affectée pénètre la zone d'effet du sort pour la première fois de son tour ou commence son tour dans la zone d'effet, elle doit effectuer un jet de sauvegarde de Charisme. Si elle le réussit, la créature ignore l'effet additionnel jusqu'à ce qu'elle quitte la zone d'effet. <br><strong><em>Courage</em></strong>. Les créatures affectées ne peuvent pas être effrayées tant qu'elles sont dans la zone d'effet. <br><strong><em>Ténèbres</em></strong>. Les ténèbres emplissent la zone. Les lumières normales, ainsi que les lumières magiques créées à partir de sorts de niveau inférieur au niveau de l'emplacement de sort que vous avez utilisé pour lancer ce sort, ne peuvent illuminer la zone. <br><strong><em>Lumière du jour</em></strong>. Une lumière vive emplit la zone. Les ténèbres magiques, créées à partir de sorts d'un niveau inférieur au niveau de l'emplacement de sort que vous avez utilisé pour lancer ce sort, ne peuvent étouffer la lumière. <br><strong><em>Protection contre une énergie</em></strong>. Les créatures affectées présentes dans la zone obtiennent la résistance à un type de dégâts de votre choix, à l'exception des types contondant, perforant et tranchant. <br><strong><em>Vulnérabilité à une énergie</em></strong>. Les créatures affectées présentes dans la zone obtiennent la vulnérabilité face à un type de dégâts de votre choix, à l'exception des types contondant, perforant et tranchant. <br><strong><em>Repos éternel</em></strong>. Les corps morts enterrés dans la zone ne peuvent pas devenir des morts-vivants. <br><strong><em>Interférence extradimensionnelle</em></strong>. Les créatures affectées ne peuvent pas de déplacer ou voyager en utilisant la téléportation ou par des moyens extradimensionnels ou interplanaires. <br><strong><em>Peur</em></strong>. Les créatures affectées sont effrayées tant qu'elles se trouvent dans la zone d'effet. <br><strong><em>Silence</em></strong>. Aucun son ne peut être produit dans la zone d'effet et les sons extérieurs ne parviennent pas à y pénétrer. <br><strong><em>Langues</em></strong>. Les créatures affectées peuvent communiquer avec toutes les autres créatures présentes dans la zone d'effet, même si elles n'ont aucun langage en commun. <br>"
	},
	{
		name: "Sens des pièges",
		originalName: "Find Traps Détection des pièges",
		castedBy: [
			"cleric",
			"druid",
			"ranger"
		],
		id: "4c873973-81c2-42bf-8553-0df17e73cdae",
		level: 2,
		school: "divination",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous ressentez la présence de tout piège se trouvant à portée et dans votre champ de vision. Un piège, dans la définition de ce sort, comprend tout ce qui pourrait infliger un effet soudain ou inattendu, effet que vous considérez comme nuisible ou indésirable, et qui a spécifiquement été conçu dans cette optique par son créateur. Par conséquent, le sort devrait sentir une zone soumise au sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=alarme\">alarme</a></em>, un <em>glyphe de protection</em> ou un piège mécanique de type fosse, mais il ne pourrait pas révéler une fragilité dans le sol, un plafond instable, ou un gouffre caché. <br>Ce sort révèle simplement qu'un piège est présent. Vous n'apprenez pas l'emplacement de chaque piège, mais vous apprenez la nature générale du danger que représente le piège que vous avez détecté. <br>"
	},
	{
		name: "Tempête de feu",
		originalName: "Fire Storm",
		castedBy: [
			"cleric",
			"druid",
			"sorcerer"
		],
		id: "d9eb00f7-a377-4455-9020-f3740d50a321",
		level: 7,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "45 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Une tempête formée de rideaux enflammés apparait à l'endroit de votre choix, dans la portée du sort. La zone de la tempête se compose de dix cubes de 3 mètres d'arête, que vous pouvez organiser à votre guise. Chaque cube doit avoir une face adjacente à la face d'un autre cube. Chaque créature dans la zone doit effectuer un jet de sauvegarde de Dextérité, subissant 7d10 dégâts de feu en cas d'échec, ou la moitié de ces dégâts en cas de réussite. <br>Le feu endommage les objets dans la zone et allume les objets inflammables qui ne sont pas portés ou transportés. Si vous le souhaitez, les végétaux dans la zone ne sont pas touchés par le sort. <br>"
	},
	{
		name: "Thaumaturgie",
		originalName: "Thaumaturgy",
		castedBy: [
			"cleric"
		],
		id: "eed0d356-4de5-40a1-a33d-39f192253625",
		level: 0,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V",
		duration: "jusqu'à 1 minute",
		description: "Vous simulez une chose extraordinaire, un signe de puissance surnaturelle. Vous créez un des effets magiques suivants dans la limite de portée du sort : <br>• Votre voix devient trois fois plus puissante que la normale pour 1 minute. <br>• Vous faîtes vaciller des flammes, augmentez ou diminuez leur intensité, ou bien encore vous changez leur couleur pendant 1 minute. <br>• Vous causez des tremblements inoffensifs dans le sol pendant 1 minute. <br>• Vous créez un son instantané qui provient d'un point de votre choix dans la limite de portée du sort, tel qu'un grondement de tonnerre, le cri d'un corbeau ou des chuchotements de mauvais augure. <br>• Vous provoquez instantanément l'ouverture ou le claquement brusque d'une porte ou d'une fenêtre non verrouillée. <br>• Vous altérez l'apparence de vos yeux pendant 1 minute. <br>Si vous lancez ce sort plusieurs fois, vous pouvez avoir activement jusqu'à trois de ses effets à la fois, et vous pouvez rompre un effet au prix d'une action. <br>"
	},
	{
		name: "Tremblement de terre",
		originalName: "Earthquake",
		castedBy: [
			"cleric",
			"druid",
			"sorcerer"
		],
		id: "01eaa6ac-0247-499e-8abd-c1618e3f0653",
		level: 8,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "150 mètres",
		components: "V, S, M (une pincée de terre, un fragment de roche et un bloc d'argile)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous générez un bouleversement sismique à un endroit visible sur le sol dans la portée du sort. Pendant la durée, une intense secousse déchire le sol sur un cercle de 30 mètres de rayon centré sur le point indiqué. Les créatures et les structures en contact avec le sol sont secouées. <br>Le sol dans la zone devient un terrain difficile. Chaque créature au sol qui se concentre doit réussir un jet de sauvegarde de Constitution, sans quoi sa concentration est brisée. <br>Lorsque vous lancez ce sort ainsi qu'à chaque fin de tour passé à vous concentrer, chaque créature au sol doit réussir un jet de sauvegarde de Dextérité ou tomber à terre. <br>Ce sort peut avoir des effets supplémentaires selon la nature du terrain dans le secteur, à la discrétion du MD. <br><strong><em>Fissures</em></strong>. Des fissures s'ouvrent dans la zone frappée par le sort au début du tour suivant l'incantation du sort. Un total de 1d6 fissures s'ouvrent à des endroits déterminés par le MD. Chacune des fissures est profonde de 1d10 x 3 mètres, mesure 3 mètres de large et s'étend d'un point sur la circonférence de la zone jusqu'au point opposé. Une créature située à l'endroit où la fissure s'ouvre doit réussir un jet de sauvegarde de Dextérité, sans quoi elle chute. Une créature qui réussit la sauvegarde se déplace avec le bord de la fissure. <br>Une fissure qui s'ouvre sous une structure cause l'effondrement de la structure (voir plus bas). <br><strong><em>Structures</em></strong>. La secousse inflige 50 dégâts contondants à toute structure en contact avec le sol qui se trouve dans la zone lorsque vous incantez le sort ainsi qu'au début de chacun de vos tours jusqu'à ce que le sort prenne fin. Si la structure atteint 0 point de vie, elle s'effondre pour possiblement blesser les créatures proches. Une créature située à la moitié ou moins de la hauteur de la structure doit réaliser un jet de sauvegarde de Dextérité. En cas d'échec, elle subit 5d6 dégâts contondants, tombe à terre et est ensevelie dans les décombres. Un jet de Force (Athlétisme) de DD 20 est requis pour s'en extirper. Le MD peut ajuster le DD en fonction de la nature des décombres. En cas de réussite, la créature subit la moitié de ces dégâts, ne tombe pas à terre et n'est pas ensevelie. <br>"
	},
	{
		name: "Appel de la foudre",
		originalName: "Call Lightning",
		castedBy: [
			"druid"
		],
		id: "09272560-8ecb-42a0-9539-7879b1f8edf5",
		level: 3,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Un nuage d'orage prend la forme d'un cylindre de 3 mètres de hauteur et d'un rayon de 18 mètres centré sur un point visible à portée au-dessus de vous. Le sort échoue si vous ne pouvez voir un point en l'air là où le nuage devrait apparaître (par exemple, si vous vous trouvez dans une pièce trop petite pour accueillir le nuage).<br>Lorsque vous incantez le sort, choisissez un point visible sous le nuage. Un éclair jaillit du nuage jusqu'au point choisi. Chaque créature à 1,50 mètre ou moins de ce point doit effectuer un jet de sauvegarde de Dextérité, subissant 3d10 dégâts de foudre en cas d'échec, ou la moitié de ces dégâts en cas de réussite. À chacun de vos tours, jusqu'à la fin du sort, vous pouvez utiliser votre action pour appeler la foudre de cette manière, en ciblant le même point ou un nouveau.<br>Si vous êtes en extérieur et dans des conditions orageuses lors de l'incantation de ce sort, le sort vous permet de contrôler l'orage plutôt que d'en créer un nouveau. Dans ces conditions, les dégâts du sort augmentent de 1d10.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, les dégâts augmentent de 1d10 pour chaque niveau d'emplacement au-delà du niveau 3.<br>"
	},
	{
		name: "Attraction terrestre",
		originalName: "Earthbind",
		castedBy: [
			"druid",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "25841929-47d2-416f-9cd1-9a0835be5220",
		level: 2,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "90 mètres",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "Choisissez une créature que vous pouvez voir dans la portée. Des bandes jaunes d'énergie magique entourent la créature. La cible doit réussir un jet de sauvegarde de Force sous peine de voir sa vitesse de vol (le cas échéant) réduite à 0 mètre pour la durée du sort. Une créature volante affectée par ce sort descend à la vitesse de 18 mètres par round jusqu'à ce qu'elle atteigne le sol ou que le sort se termine.<br>"
	},
	{
		name: "Aversion/Attirance",
		originalName: "Antipathy/Sympathy",
		castedBy: [
			"druid",
			"wizard"
		],
		id: "425df73a-fdf3-4d8a-8721-bde9fafdc284",
		level: 8,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 heure",
		range: "18 mètres",
		components: "V, S, M (soit un morceau d'aluminium trempé dans du vinaigre pour l'effet aversion, soit une goutte de miel pour l'effet attirance)",
		duration: "10 jours",
		description: "Ce sort attire ou repousse les créatures de votre choix. Vous ciblez quelque chose à portée, soit un objet de taille TG ou inférieure, soit une créature, soit une zone dont les dimensions maximales ne dépassent pas celles d'un cube de 60 mètres d'arête. Puis spécifiez une sorte de créature intelligente, comme les dragons rouges, les gobelins ou les vampires.<br>Vous conférez à la cible une aura qui va soit attirer, soit repousser les créatures spécifiées pour toute la durée du sort. Choisissez l'effet de l'aura, entre l'attirance et l'aversion.<br><strong>Aversion</strong>. L'enchantement donne, aux créatures que vous avez désignées, le besoin urgent de quitter la zone et de fuir la cible. Lorsqu'une créature désignée peut voir la cible ou s'approche à 18 mètres ou moins d'elle, la créature doit réussir un jet de sauvegarde de Sagesse ou être effrayée. La créature reste effrayée tant qu'elle peut voir la cible ou qu'elle se trouve à 18 mètres ou moins d'elle. Tant qu'elle est effrayée par la cible, la créature doit utiliser son mouvement pour se déplacer vers l'endroit sûr le plus proche et duquel elle ne pourra pas voir la cible. Si la créature se déplace à plus de 18 mètres de la cible et qu'elle ne peut pas la voir, la créature n'est plus effrayée, mais elle redevient immédiatement effrayée si elle a de nouveau la cible en ligne de mire ou si elle se trouve de nouveau à 18 mètres ou moins de la cible.<br><strong>Attirance</strong>. L'enchantement donne, aux créatures que vous avez désignées, le besoin urgent de s'approcher de la cible tant qu'elles se trouvent à 18 mètres ou moins d'elle ou qu'elles peuvent la voir. Lorsqu'une créature désignée peut voir la cible ou se trouve à 18 mètres ou moins d'elle, la créature doit réussir un jet de sauvegarde de Sagesse sous peine de devoir utiliser son mouvement, à chaque tour, pour entrer dans la zone ou se déplacer à portée de la cible. Une fois que la créature a agi de la sorte, elle ne peut s'éloigner volontairement de la cible.<br>Si la cible inflige des dégâts ou quelque autre tort à une créature affectée, la créature affectée peut effectuer un jet de sauvegarde de Sagesse pour mettre un terme à l'effet, comme décrit ci-dessous.<br><strong>Mettre un terme à l'effet</strong>. Si une créature affectée termine son tour en étant à plus de 18 mètres de la cible et sans être capable de la voir, la créature effectue un jet de sauvegarde de Sagesse. En cas de réussite, la créature n'est plus affectée par la cible et se rend compte que son sentiment d'aversion ou d'attirance lui avait été magiquement inspiré. De plus, une créature affectée par le sort est autorisée à effectuer un autre de jet de sauvegarde de Sagesse toutes les 24 heures tant que le sort persiste.<br>Une créature qui réussit son jet de sauvegarde contre cet effet y est immunisée pour 1 minute, après quoi elle peut de nouveau être affectée.<br>"
	},
	{
		name: "Baies nourricières",
		originalName: "Goodberry",
		castedBy: [
			"druid",
			"ranger"
		],
		id: "f18597b6-8508-4548-9529-086151ac333b",
		level: 1,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (une branche de gui)",
		duration: "instantanée",
		description: "Jusqu'à dix baies imprégnées de magie apparaissent dans votre main pour la durée de leur potentiel (voir ci-dessous). Une créature peut utiliser son action pour manger une baie. Manger une baie rend 1 point de vie, et la baie est suffisamment nourrissante pour sustenter une créature pour une journée.<br>Les baies perdent leur potentiel si elles n'ont pas été consommées dans les 24 heures qui suivent le lancement du sort.<br>"
	},
	{
		name: "Bosquet des druides",
		originalName: "Druid Grove",
		castedBy: [
			"druid"
		],
		id: "8bf13463-9ced-4e27-b709-76db1143bc3e",
		level: 6,
		school: "abjuration",
		isRitual: false,
		castingTime: "10 minutes",
		range: "contact",
		components: "V, S, M (du gui, que le sort consomme, récolté avec une faucille en or lors d'une pleine lune)",
		duration: "24 heures",
		description: "Protège une zone de 27 x 27 x 27 m par un brouillard, des lianes, des arbres animés, ou autres effets."
	},
	{
		name: "Bourrasque",
		originalName: "Gust of Wind",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "175ed270-15fb-4c5b-836d-c9ec5bdb5abf",
		level: 2,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (ligne de 18 mètres)",
		components: "V, S, M (une semence de légume)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Un corridor de vent fort long de 18 mètres et large de 3 mètres souffle de votre position vers une direction de votre choix, pour la durée du sort. Chaque créature qui débute son tour dans le corridor doit réussir un jet de sauvegarde de Force, sans quoi elle est poussée de 4,50 mètres dans l'axe du corridor.<br>Toute créature dans le corridor doit consommer 2 mètres de mouvement pour chaque mètre parcouru lorsqu'elle se rapproche de vous.<br>La bourrasque disperse les gaz et la vapeur, et elle éteint les chandelles, les torches et les autres flammes exposées dans la zone. Elle fait vaciller les flammes protégées, comme celle d'une lanterne, qui ont alors 50 % de chance de s'éteindre.<br>Lors d'une action bonus à chacun de vos tours avant que le sort prenne fin, vous pouvez changer la direction du corridor de vent.<br>"
	},
	{
		name: "Changement de forme",
		originalName: "Shapechange",
		castedBy: [
			"druid",
			"wizard"
		],
		id: "7f619f6c-24cb-4fff-8136-284a1eced992",
		level: 9,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (une fine couronne de jade valant au moins 1 500 po, que vous devez placer sur votre tête avant de lancer le sort)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous prenez la forme d'une créature différente pour toute la durée du sort. La nouvelle forme peut être d'un FP inférieur ou égal à votre niveau. La créature ne peut pas être un mort-vivant ou un artificiel, et vous devez déjà avoir vu une créature de cette espèce au moins une fois. Vous vous transformez en un individu basique de cette espèce de créature, n'ayant ni niveau de classe ni de capacité de lanceur de sorts.<br>Vos statistiques de jeu sont remplacées par celles de la créature choisie, vous conservez cependant votre alignement et vos valeurs d'Intelligence, de Sagesse, et de Charisme. Vous conservez également vos maîtrises de compétences et de jets de sauvegarde, et gagnez en plus celles de votre nouvelle forme. Si la créature possède les mêmes maîtrises que vous et que son bonus est supérieur au vôtre, utilisez le bonus de la créature. Vous ne pouvez utiliser ni les actions légendaires ni les actions de repaire de votre nouvelle forme.<br>Votre total de points de vie et de dés de vie est celui de votre nouvelle forme. Lorsque vous revenez à votre forme normale, vous retrouvez les points de vie que vous aviez avant de vous transformez en une autre créature. Si vous revenez à votre forme normale parce que vous êtes tombé à 0 point de vie, les dégâts supplémentaires que vous avez reçus sont infligés à votre forme normale. Tant que les dégâts supplémentaires ne font pas tomber votre forme normale à 0 point de vie, vous ne devenez pas inconscient.<br>Vous conservez le bénéfice de toutes vos capacités de classe, de race, ou de toute autre source, et pouvez les utiliser, à condition que votre nouvelle forme physique vous le permette. Vous ne pouvez pas utiliser les sens spéciaux que vous aviez (comme la vision dans le noir par exemple) à moins que votre nouvelle forme les ait également. Vous ne pouvez parler que si la créature est normalement capable de parler.<br>Lorsque vous vous transformez, vous choisissez si votre équipement tombe sur le sol, fusionne avec votre nouvelle forme ou est porté par votre nouvelle forme. L'équipement porté fonctionne correctement, mais le MD décide pour chaque pièce d'équipement s'il est possible pour votre nouvelle forme de la porter, en fonction de la morphologie et de la taille de la créature. Votre équipement ne change pas de taille ou de forme pour s'adapter à votre nouvelle forme, et tout l'équipement que la nouvelle forme ne peut pas porter tombe sur le sol ou fusionne avec vous. L'équipement qui fusionne avec la nouvelle forme n'a aucun effet tant que vous restez sous cette forme.<br>Pour toute la durée du sort, vous pouvez utiliser votre action pour changer de nouveau de forme avec les mêmes conditions et règles que pour la forme précédente, à une exception près : si votre nouvelle forme possède plus de points de vie que votre forme actuelle, votre nombre de points de vie reste le même.<br>"
	},
	{
		name: "Communion avec la nature",
		originalName: "Commune with Nature",
		castedBy: [
			"druid",
			"ranger"
		],
		id: "1a554e1b-4da7-4458-a370-e780415ad93b",
		level: 5,
		school: "divination",
		isRitual: true,
		castingTime: "1 minute",
		range: "personnelle",
		components: "V, S",
		duration: "instantanée",
		description: "Vous ne faites brièvement qu'un avec la nature et obtenez des informations sur le territoire alentour. À l'extérieur, le sort vous donne la connaissance du terrain à 4,5 kilomètres autour de vous. Dans des grottes ou tout autre milieu souterrain, le rayon de connaissance est réduit à 90 mètres. Le sort ne fonctionne pas là où des constructions ont pris la place de la nature, comme dans des donjons ou des villes.<br>Vous obtenez instantanément la connaissance de trois types d'informations sur la zone, parmi celles proposées ci-dessous :<br>• Terrain et plans d'eau<br>• Plantes, minéraux, animaux ou peuples courants<br>• Puissants célestes, fiélons, fées, élémentaires ou morts-vivants<br>• Influence des autres plans d'existence<br>• Bâtiments<br>Par exemple, vous pourriez déterminer l'emplacement d'un puissant mort-vivant dans la zone, la localisation des principales sources d'eau potables, et situer les villes à proximité.<br>"
	},
	{
		name: "Contrôle des flammes",
		originalName: "Control Flames",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "961429cc-f6f4-494a-8ddb-cd8b4ae687bd",
		level: 0,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "S",
		duration: "instantanée ou 1 heure (voir ci-dessous)",
		description: "Vous choisissez un feu non magique visible dans la portée du sort de 1,50 mètre d'arête maximum. Vous pouvez l'affecter de l'une des façons suivantes&nbsp;:<br>• Vous pouvez faire grossir instantanément le feu de 1,50 mètre dans une direction, à condition que du bois ou un autre combustible soit présent dans cette nouvelle zone.<br>• Vous pouvez éteindre instantanément les flammes à l'intérieur du cube.<br>• Vous pouvez doubler ou diminuer de moitié l'aire de lumière vive ou de lumière faible projetée par le feu et/ou en changer la couleur. La modification dure 1 heure.<br>• Vous pouvez faire apparaitre des formes simples (comme une vague silouette de créature, un objet inanimé ou une localisation) dans les flammes et les animer comme bon vous semble. Les silhouettes persistent pendant 1 heure.<br>Si vous lancez ce sort plusieurs fois, vous pouvez avoir jusqu'à trois de ses effets non-instantanés actifs à la fois, et vous pouvez en dissiper un en une action.<br>"
	},
	{
		name: "Contrôle des vents",
		originalName: "Control Winds",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "6e4da543-3975-4a18-8172-5ad9b7415564",
		level: 5,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "90 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous prenez le contrôle de l'air dans un cube de 30 mètres d'arête visible dans la portée du sort. Vous pouvez choisir un des effets suivants lorsque vous lancez le sort. L'effet perdure jusqu'à la fin du sort, à moins que vous n'utilisiez votre action au cour d'un tour ultérieur pour changer d'effet. Vous pouvez aussi utiliser votre action pour momentanément arrêter l'effet ou pour renouveler un effet que vous auriez arrêté.<br><strong>Rafales</strong>. Un vent se lève au centre du cube et souffle continuellement dans une direction horizontale que vous choisissez. Vous pouvez décider de l'intensité du vent : calme, modéré ou fort. Si le vent est modéré ou fort, les attaques avec des armes à distance qui entrent dans, sortent de ou traversent ce cube ont un désavantage aux jets d'attaque. Si le vent est fort, toute créature se déplaçant contre le vent doit dépenser un mètre de déplacement supplémentaire pour chaque mètre avancé.<br><strong>Écrasement</strong>. Vous créez un fort coup de vent descendant ayant pour source le sommet du cube. Les attaques avec des armes à distance qui traversent cette zone ou visent des cibles situées à l'intérieur ont un désavantage à leurs jets d'attaque. Une créature doit faire un jet de sauvegarde de Force si elle vole dans le cube pour la première fois dans un tour ou si elle commence son tour dans cette zone en volant. En cas d'échec, la créature tombe à terre.<br><strong>Ascension</strong>. Vous créez un courant ascendant soutenu à l'intérieur du cube provenant de la face inférieure du cube. Les créatures tombant dans le cube ne subissent que la moitié des dégâts dus à la chute. Lorsqu'une créature dans le cube réalise un saut vertical, elle peut sauter jusqu'à 3 mètres de plus que la normale.<br>"
	},
	{
		name: "Convocation d'élémentaire",
		originalName: "Summon Elemental",
		castedBy: [
			"druid",
			"ranger",
			"wizard"
		],
		id: "2e698b90-6dfa-49f7-a099-3c73e78fd18e",
		level: 4,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (de l'air, un caillou, de la cendre et de l'eau dans un flacon incrusté d'or d'une valeur d'au moins 400 po)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Invoque 1 esprit d'élémentaire (air, terre, feu ou eau) amical (bloc stat/votre niv)."
	},
	{
		name: "Convocation de bête",
		originalName: "Summon Beast",
		castedBy: [
			"druid",
			"ranger"
		],
		id: "9eb51fb3-63bd-4141-8c37-c60269e0afc3",
		level: 2,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (une plume, une touffe de fourrure et une queue de poisson dans un gland doré d'une valeur d'au moins 200 po)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Invoque 1 esprit de bête (air, terre ou eau) amical (bloc stat/votre niv)."
	},
	{
		name: "Convocation de fée",
		originalName: "Summon Fey",
		castedBy: [
			"druid",
			"ranger",
			"warlock",
			"wizard"
		],
		id: "f2e0af69-87ed-4feb-879b-2e5e133d4708",
		level: 3,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (une fleur dorée d'une valeur d'au moins 300 po)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Invoque 1 esprit de fée (furieux, joyeux ou rusé) amical (bloc stat/votre niv)."
	},
	{
		name: "Coquille antivie",
		originalName: "Antilife Shell",
		castedBy: [
			"druid"
		],
		id: "24940847-6856-4730-aa60-187dedf2b2ab",
		level: 5,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (rayon de 3 mètres)",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Une barrière scintillante émane de vous dans un rayon de 3 mètres et se déplace avec vous, restant centrée autour de vous et bloquant les créatures autres que celles de type mort-vivant ou artificiel. La barrière reste en place pour toute la durée du sort.<br>La barrière empêche les créatures affectées de pénétrer ou de traverser la zone. Une créature affectée peut lancer des sorts ou effectuer des attaques avec des armes à distance ou des armes à allonge au travers de la barrière.<br>Si vous vous déplacez de sorte qu'une créature affectée est obligée de passer au travers de la barrière, le sort prend fin.<br>"
	},
	{
		name: "Couteau de glace",
		originalName: "Ice Knife",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "3c67eb66-925a-41c0-a13d-e50300a41fa7",
		level: 1,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "S, M (une goutte d'eau ou un bout de glace)",
		duration: "instantanée",
		description: "Vous créez un éclat de glace et le lancez vers une créature dans la portée du sort. Faites une attaque à distance avec un sort contre la cible. Si elle réussit, la cible subit 1d10 dégâts perforants. Que l'attaque touche ou pas, l'éclat de glace explose. La cible et toutes les créatures dans un rayon de 1,50 mètre autour d'elle doivent réussir un jet de sauvegarde de Dextérité ou subir 2d6 dégâts de froid.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts de froid infligés augmentent de 1d6 pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Croissance d'épines",
		originalName: "Spike Growth",
		castedBy: [
			"druid",
			"ranger"
		],
		id: "b1c77615-5183-404b-b803-eb70e1a9a410",
		level: 2,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "45 mètres",
		components: "V, S, M (sept épines pointues ou sept brindilles taillées en pointe)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Le sol, sur un rayon de 6 mètres centré sur un point dans la portée du sort, se retourne et fait germer des épines rigides et des ronces. La zone devient un terrain difficile pour la durée du sort. Lorsqu'une créature entre ou se déplace dans la zone, elle subit 2d4 dégâts perforants pour chaque 1,50 mètre de déplacement.<br>La transformation du sol est camouflée afin de paraître naturelle. Toute créature qui ne voit pas la zone lorsque le sort est incanté doit réussir un jet de Sagesse (Perception) contre le DD de sauvegarde de votre sort, sans quoi elle ne reconnait pas la nature dangereuse du terrain avant d'y pénétrer.<br>"
	},
	{
		name: "Domination de bête",
		originalName: "Dominate Beast Domination d'animal",
		castedBy: [
			"druid",
			"sorcerer"
		],
		id: "97c77a96-4ff0-4342-b3ba-1b9d47436918",
		level: 4,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous tentez d'envoûter une bête à portée que vous pouvez voir. Elle doit réussir un jet de sauvegarde de Sagesse ou être charmée pour la durée du sort. Si vous, ou une autre créature qui vous est amicale, êtes en combat avec la bête ciblée, elle obtient un avantage à son jet de sauvegarde.<br>Tant que la bête est charmée et que vous vous trouvez dans le même plan d'existence, vous établissez une connexion télépathique avec elle. Vous pouvez utiliser ce lien télépathique pour transmettre des ordres à la créature tant que vous êtes conscient (aucune action n'est requise), et la créature fera de son mieux pour vous obéir. Vous pouvez spécifier une action simple et générale telle que « Attaque cette créature », « Viens ici » ou « Rapporte cet objet ». Si la créature accomplit l'ordre donné et ne reçoit pas d'autres directives de votre part, elle se défend et se protège du mieux de ses capacités.<br>Vous pouvez utiliser votre action pour prendre un contrôle total et précis de la cible. Jusqu'à la fin de votre prochain tour, la créature n'effectue que les actions que vous choisissez, et ne fait rien que vous ne lui ayez autorisé. Durant ce moment, vous pouvez également forcer la créature à utiliser une réaction, mais pour cela vous devez dépenser votre réaction. À chaque fois que la cible subit des dégâts, elle doit effectuer un jet de sauvegarde de Sagesse contre votre sort. Si le jet de sauvegarde réussit, le sort prend fin.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 5, vous pouvez maintenir votre concentration sur ce sort pendant 10 minutes. Lorsque vous utilisez un emplacement de sort de niveau 6, vous pouvez maintenir votre concentration sur ce sort pendant 1 heure. Et en utilisant un emplacement de sort de niveau 7, vous pouvez maintenir votre concentration pendant 8 heures.<br>"
	},
	{
		name: "Druidisme",
		originalName: "Druidcraft",
		castedBy: [
			"druid"
		],
		id: "0744295c-fadd-418c-9bac-135503c4e049",
		level: 0,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "En murmurant aux esprits de la nature, vous créez l'un des effets suivants, dans la portée du sort :<br>• Vous créez un minuscule et inoffensif effet sensoriel qui permet de prédire les conditions météorologiques pour les 24 prochaines heures, à l'endroit où vous êtes. L'effet pourrait se manifester comme un orbe doré pour indiquer un ciel dégagé, un nuage pour annoncer la pluie, un flocon de neige pour une chute de neige et ainsi de suite. L'effet persiste pour 1 round.<br>• Vous provoquez immédiatement la floraison d'une fleur, l'ouverture d'une gousse ou le débourrement d'un bourgeon de feuille.<br>• Vous créez un inoffensif effet sensoriel instantané comme une chute de feuilles, une légère brise, le son d'un petit animal ou une subtile odeur de putois. L'effet doit se limiter à un cube de 1,50 mètre d'arête.<br>• Vous éteignez ou allumez instantanément une chandelle, une torche ou un petit feu de camp.<br>"
	},
	{
		name: "Éclat du soleil",
		originalName: "Sunburst",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "c82d34d7-1578-4a9c-b9a5-622d5b55faa7",
		level: 8,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "45 mètres",
		components: "V, S, M (une source de feu et une pierre de soleil/héliolite)",
		duration: "instantanée",
		description: "Une vive lumière équivalente à celle du soleil éclaire dans un rayon de 18 mètres, centrée sur un point que vous choisissez dans la portée du sort. Chaque créature dans la lumière doit faire un jet de sauvegarde de Constitution. En cas d'échec, une créature subit 12d6 dégâts radiants et est aveuglée pendant 1 minute. En cas de réussite, elle subit la moitié de ces dégâts et n'est pas aveuglée par le sort. Les morts-vivants et vases ont un désavantage à ce jet de sauvegarde.<br>Une créature aveuglée par le sort fait un autre jet de sauvegarde de Constitution à la fin de chacun de ses tours. En cas de réussite, elle n'est plus aveuglée.<br>Ce sort dissipe dans sa zone toute ténèbres créées par un sort.<br>"
	},
	{
		name: "Enchevêtrement",
		originalName: "Entangle",
		castedBy: [
			"druid"
		],
		id: "a3d6e526-a1ae-44bc-9fcb-c8b78a48570d",
		level: 1,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Herbes et lianes germent du sol dans un carré de 6 mètres d'arête ayant son origine sur un point dans la portée du sort. Pour la durée du sort, ces plantes rendent le terrain difficile.<br>Une créature prise dans la zone lorsque vous incantez le sort doit réussir un jet de sauvegarde de Force ou être entravée par l'enchevêtrement de plantes jusqu'à la fin du sort. Une créature entravée par les plantes peut utiliser une action pour faire un jet de sauvegarde de Force contre le DD de sauvegarde de votre sort. En cas de réussite, la créature se libère.<br>Lorsque le sort prend fin, les plantes invoquées se fanent.<br>"
	},
	{
		name: "Éruption de terre",
		originalName: "Erupting Earth",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "5ab9bda0-1f06-438d-9440-02688611dc10",
		level: 3,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (un morceau d'obsidienne)",
		duration: "instantanée",
		description: "Choisissez un point au sol que vous pouvez voir dans la portée du sort. Une éruption de roche et de terre éclate dans un cube de 6 mètres d'arête centré sur ce point. Chaque créature dans cette zone effectuer un jet de sauvegarde de Dextérité. Une créature subit 3d12 dégâts contondants en cas d'échec, ou la moitié de ces dégâts en cas de réussite. En outre, le terrain dans cette zone devient un terrain difficile jusqu'à qu'il soit déblayé. Chaque case de 1,50 mètre de la zone nécessite au moins 1 minute pour être déblayé à la main.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, les dégâts augmentent de 1d12 pour chaque niveau d'emplacement au-delà du niveau 3.<br>"
	},
	{
		name: "Esprit guérisseur",
		originalName: "Healing Spirit",
		castedBy: [
			"druid",
			"ranger"
		],
		id: "74fc4260-240e-4ddb-be3b-bace19ed117f",
		level: 2,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "18 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous appelez un esprit de la nature pour apaiser les blessés. L'esprit immatériel apparaît dans un espace qui est un cube de 1,50 mètre d'arête que vous pouvez voir à portée. L'esprit ressemble à une bête ou à une fée transparente (selon votre choix).<br>Jusqu'à la fin du sort, chaque fois que vous ou une créature que vous pouvez voir vous déplacez dans l'espace de l'esprit pour la première fois pendant un tour, ou si vous commencez votre tour dans cet espace, vous pouvez amener l'esprit à restaurer 1d6 points de vie à cette créature (aucune action n'est requise). L'esprit ne peut pas guérir les morts-vivants ou les artificiels. L'esprit peut soigner un nombre de fois égal à 1 + le modificateur de votre caractéristique d'incantation (minimum 2). Une fois la limite atteinte, l'esprit disparait [E].<br>Par une action bonus à votre tour, vous pouvez déplacer l'esprit jusqu'à 9 mètres vers un espace que vous pouvez voir.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, les soins augmentent de 1d6 pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Façonnage de l'eau",
		originalName: "Shape Water Modeler l'eau",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "7a0f6848-8f97-439d-92ac-a79021b06d83",
		level: 0,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "S",
		duration: "instantanée ou 1 heure (voir ci-dessous)",
		description: "Choisissez un cube d'eau visible de 1,50 mètre d'arête dans la portée du sort. Vous pouvez alors le manipuler d'une des façons suivantes&nbsp;:<br>• Vous déplacez instantanément ou modifiez le sens du courant selon vos directives jusqu'à 1,50 mètre dans n'importe quelle direction. Ce mouvement n'a pas assez de force pour causer des dégâts.<br>• Vous pouvez faire apparaitre des formes simples dans l'eau et les animer selon vos instructions. Ce changement dure 1 heure.<br>• Vous modifiez la couleur ou l'opacité de l'eau. L'eau doit être transformée de façon homogène. Ce changement dure 1 heure.<br>• Vous gelez l'eau, à condition qu'elle ne contienne aucune créature. L'eau dégèle au bout de 1 heure.<br>Si vous lancez ce sort plusieurs fois, vous ne pouvez avoir que deux de ces effets non-instantanés actifs à la fois, et vous pouvez en dissiper un en une action.<br>"
	},
	{
		name: "Façonnage de la terre",
		originalName: "Mold Earth Modeler la terre",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "b3856008-6ebb-4a0a-b329-7dc07eb57c93",
		level: 0,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "S",
		duration: "instantanée ou 1 heure (voir ci-dessous)",
		description: "Vous choisissez une section de terre ou de pierre qui ne dépasse pas un cube de 1,50 mètre d'arête et visible dans la portée du sort. Vous pouvez alors la manipuler d'une des façons suivantes&nbsp;:<br>• Si vous ciblez une zone de terre meuble, vous pouvez instantanément la creuser, la déplacer sur le sol, et la déposer jusqu'à 1,50 mètre plus loin. Ce mouvement n'a pas assez de force pour causer des dégâts.<br>• Vous pouvez faire apparaitre des formes et/ou des couleurs sur la terre ou la pierre, représentant des mots, créant des images ou formant des motifs. La modification dure 1 heure.<br>• Si la terre ou la pierre est au sol, vous pouvez la transformer en terrain difficile. À l'inverse, vous pouvez rendre normal un sol considéré comme terrain difficile. Ce changement dure 1 heure.<br>Si vous lancez ce sort plusieurs fois, vous pouvez avoir jusqu'à deux de ces effets non-instantanés actifs à la fois, et vous pouvez en dissiper un en une action.<br>"
	},
	{
		name: "Flammes",
		originalName: "Produce Flame",
		castedBy: [
			"druid"
		],
		id: "477d88e6-9f4d-4be0-bd48-457c3301caf0",
		level: 0,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "10 minutes",
		description: "Une flamme vacillante apparaît dans votre main. La flamme y reste pour la durée du sort et n'endommage pas votre équipement, ni ne vous blesse. La flamme diffuse une lumière vive dans un rayon de 3 mètres et une lumière faible dans un rayon supplémentaire de 3 mètres. Le sort prend fin si vous l'annulez par une action ou si vous le lancez de nouveau.<br>Vous pouvez également attaquer avec la flamme, mettant ainsi un terme au sort. Lorsque vous incantez ce sort, ou en utilisant une action lors d'un tour suivant, vous pouvez lancer la flamme sur une créature située à 9 mètres de vous maximum. Faites une attaque à distance avec un sort. En cas de réussite, la cible subit 1d8 dégâts de feu.<br>Les dégâts de ce sort augmentent de 1d8 lorsque vous atteignez le niveau 5 (2d8), le niveau 11 (3d8) et le niveau 17 (4d8).<br>"
	},
	{
		name: "Flétrissement",
		originalName: "Blight",
		castedBy: [
			"druid",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "ab79f30b-4a10-4f42-afac-e5e82a440d1d",
		level: 4,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "De l'énergie nécromantique déferle sur une créature de votre choix, que vous pouvez voir et à portée, drainant ses liquides corporels et sa vitalité. La cible doit effectuer un jet de sauvegarde de Constitution, subissant 8d8 dégâts nécrotiques en cas d'échec, ou la moitié de ces dégâts en cas de réussite. Ce sort n'a pas d'effet sur un mort-vivant ou un artificiel. Si vous ciblez une créature de type plante ou une plante magique, elle effectue son jet de sauvegarde avec un désavantage, et le sort lui inflige les dégâts maximums.<br>Si vous ciblez une plante non magique qui n'est pas non plus une créature, comme un arbre ou un buisson, elle n'effectue pas de jet de sauvegarde ; elle se flétrit simplement et meurt.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 5 ou supérieur, les dégâts sont augmentés de 1d8 pour chaque niveau d'emplacement au-delà du niveau 4.<br>"
	},
	{
		name: "Formes animales",
		originalName: "Animal Shapes Métamorphose animale",
		castedBy: [
			"druid"
		],
		id: "dbcb328b-07b1-414b-bdec-9b5ee8fc6a15",
		level: 8,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 24 heures",
		description: "Votre magie transforme les autres en bêtes. Vous pouvez cibler toutes les créatures consentantes que vous pouvez voir et à portée. Vous transformez chacune de ces créatures en une bête de taille G ou inférieure avec un FP de 4 ou inférieur. Aux tours suivants, vous pouvez utiliser votre action pour changer de nouveau la forme des créatures transformées.<br>La transformation reste effective pour chacune des cibles tant que le sort dure ou jusqu'à ce que la cible tombe à 0 point de vie ou qu'elle meure.<br>Les statistiques d'une cible sont remplacées par les statistiques de la bête choisie. Cependant la cible conserve son alignement, ainsi que ses valeurs de caractéristique d'Intelligence, de Sagesse et de Charisme. La cible acquiert les points de vie de sa nouvelle forme et lorsqu'elle retrouve sa forme d'origine, elle retourne au nombre de points de vie qu'elle avait d'être métamorphosée. Si la cible retrouve sa forme d'origine parce qu'elle est tombée à 0 point de vie, les dégâts restants sont appliqués à sa forme normale. Tant que les dégâts restants ne font pas tomber la forme normale de la cible à 0 point de vie, elle ne tombe pas inconsciente. La créature est limitée aux actions qu'elle peut effectuer sous sa nouvelle forme et ne peut ni parler ni lancer des sorts.<br>L'équipement de la cible fusionne avec sa nouvelle forme. La cible ne peut pas activer, manipuler, ou bénéficier de quelque manière que ce soit de son équipement.<br>"
	},
	{
		name: "Fureur de la nature",
		originalName: "Wrath of Nature",
		castedBy: [
			"druid",
			"ranger"
		],
		id: "cf2a78af-266b-4576-ab38-d2273f988ee5",
		level: 5,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Anime arbres, roches et plantes dans un cube de 18 x 18 x 18 m."
	},
	{
		name: "Gardien de la nature",
		originalName: "Guardian of Nature",
		castedBy: [
			"druid",
			"ranger"
		],
		id: "207fc5e2-d8de-45ee-b8ab-6c7393699dc2",
		level: 4,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "Un esprit de la nature répond à votre appel et vous transforme en un puissant gardien. La transformation dure jusqu'à la fin du sort. Choisissez l'une des formes suivantes&nbsp;:<br><strong>Bête primitive</strong>. Une fourrure de bête recouvre votre corps, les traits de votre visage deviennent sauvages et vous bénéficiez des avantages suivants :<br>• Votre vitesse de marche augmente de 3 mètres.<br>• Vous gagnez vision dans le noir avec une portée de 36 mètres.<br>• Vous effectuez les jets d'attaque basés sur la Force avec un avantage.<br>• Vos attaques avec une arme au corps à corps infligent 1d6 dégâts de force supplémentaires si vous touchez.<br><strong>Grand arbre</strong>. Votre peau semble être une écorce, des feuilles poussent dans vos cheveux et vous bénéficiez des avantages suivants:<br>• Vous gagnez 10 points de vie temporaires.<br>• Vous effectuez les jets de sauvegarde de Constitution avec un avantage.<br>• Vous effectuez les jets d'attaque basés sur la Dextérité ou la Sagesse avec un avantage.<br>• Si vous êtes sur le sol, le sol dans un rayon de 4,50 mètres autour de vous est un terrain difficile pour vos ennemis.<br>"
	},
	{
		name: "Gourdin magique",
		originalName: "Shillelagh Crosse des druides",
		castedBy: [
			"druid"
		],
		id: "6d06919f-a121-490d-a342-c041a599ea68",
		level: 0,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "contact",
		components: "V, S, M (du gui, une feuille de trèfle et un bâton ou un gourdin)",
		duration: "1 minute",
		description: "Le bois du bâton ou du gourdin que vous tenez est altéré par les pouvoirs de la nature. Pour la durée du sort, vous pouvez utiliser votre caractéristique d'incantation plutôt que votre Force pour les jets d'attaque au corps à corps et de dégâts avec cette arme, et les dégâts de l'arme deviennent des d8. De plus, l'arme devient une arme magique, si ce n'est pas déjà le cas. Ce sort se termine si vous le lancez de nouveau ou si vous lâchez l'arme enchantée.<br>"
	},
	{
		name: "Infestation",
		originalName: "Infestation",
		castedBy: [
			"druid",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "3a87cc3d-d8ec-4172-92f4-712de5dcbb27",
		level: 0,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (une puce vivante)",
		duration: "instantanée",
		description: "Vous faites apparaître momentanément sur une créature que vous pouvez voir à portée un nuage de mites, de puces ou d'autres parasites. La cible doit réussir un jet de sauvegarde de Constitution ou subir 1d6 dégâts de poison et se déplacer de 1,50 mètre dans une direction aléatoire, si elle peut se déplacer et que sa vitesse est d'au moins 1,50 mètre. Jetez un d4 pour la direction: 1=nord; 2=sud; 3=est; 4=ouest. Ce mouvement ne provoque pas d'attaques d'opportunité, et si la direction indiquée est bloquée la cible ne bouge pas.<br>Les dégâts du sort augmentent de 1d6 lorsque vous atteignez le niveau 5 (2d6), le niveau 11 (3d6) et le niveau 17 (4d6).<br>"
	},
	{
		name: "Insecte géant",
		originalName: "Giant Insect",
		castedBy: [
			"druid"
		],
		id: "7a7bcfa6-de5e-4ebd-8e5b-b0904cba04ef",
		level: 4,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous transformez jusqu'à dix mille-pattes, trois araignées, cinq guêpes, ou un scorpion, à portée, en version géante de leur forme naturelle pour toute la durée du sort. Un mille-pattes devient un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=mille-pattes-geant\">mille-pattes géant</a>, une araignée devient une <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=araignee-geante\">araignée géante</a>, une guêpe devient une <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=guepe-geante\">guêpe géante</a>, et un scorpion devient un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=scorpion-geant\">scorpion géant</a>.<br>Chaque créature obéit à vos ordres verbaux et, en combat, à chaque round, elles agissent à votre tour. Le MD possède les statistiques de ces créatures et détermine leurs actions et déplacements.<br>Une créature reste à sa taille géante pour la durée du sort, jusqu'à ce qu'elle tombe à 0 point de vie, ou jusqu'à ce que vous utilisiez une action pour annuler l'effet sur elle.<br>Le MD peut vous autoriser à choisir des cibles différentes de celles présentées ci-dessus. Par exemple, si vous transformez une abeille, sa version géante pourrait avoir les mêmes statistiques que la guêpe géante.<br>"
	},
	{
		name: "Inversion de la gravité",
		originalName: "Reverse Gravity",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "b993d62d-36aa-46bd-b47c-5c2677628017",
		level: 7,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "30 mètres",
		components: "V, S, M (de la magnétite et quelques copeaux de fer)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Ce sort renverse la gravité dans un cylindre de 15 mètres de rayon et 30 mètres de haut centré sur un point à portée. Toutes les créatures et tous les objets dans la zone, qui ne sont pas maintenus au sol d'une manière ou d'une autre, tombent vers le haut et atteignent le point culminant de la zone au moment où vous lancez le sort. Une créature peut effectuer un jet de sauvegarde de Dextérité pour attraper un objet fixé au sol qu'elle peut atteindre, et ainsi éviter de tomber.<br>Si les créatures et objets rencontrent dans leur chute des objets solides (comme un plafond), ils le percutent comme ils l'auraient fait s'ils tombaient normalement du haut vers le bas. Si un objet ou une créature atteint le sommet de la zone d'effet sauf rien percuter, il y reste, oscillant lentement, pour toute la durée du sort.<br>Lorsque le sort prend fin, les objets et créatures affectées tombent au sol.<br>"
	},
	{
		name: "Invocation d'animaux",
		originalName: "Conjure Animals",
		castedBy: [
			"druid",
			"ranger"
		],
		id: "841b20f9-9186-48d9-80c2-b56b95dfd3b3",
		level: 3,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous invoquez les esprits des fées qui prennent la forme de bêtes et apparaissent dans des espaces inoccupés à portée que vous pouvez voir. Choisissez ce qui apparaîtra via l'une des options suivantes&nbsp;:<br>• Une bête de FP 2 ou inférieur<br>• Deux bêtes de FP 1 ou inférieur<br>• Quatre bêtes de FP 1/2 ou inférieur<br>• Huit bêtes de FP 1/4 ou inférieur<br>Chaque bête est également considérée comme une fée, et elle disparaît lorsqu'elle tombe à 0 point de vie ou lorsque le sort prend fin. Les créatures invoquées sont amicales envers vous et vos compagnons. Lancez l'initiative pour le groupe de créatures invoquées ; il a ses propres tours de jeu. Elles obéissent aux ordres verbaux que vous leur donnez (aucune action n'est requise de votre part). Si vous ne leur donnez aucun ordre, elles ne font que se défendre contre les créatures qui leur sont hostiles. Le MD possède les statistiques des créatures.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant certains niveaux d'emplacement de sort, vous choisissez l'option d'invocation ci-dessus, et plus de créatures apparaissent : deux fois plus de créatures invoquées avec un emplacement de sort de niveau 5, trois fois plus avec un emplacement de sort de niveau 7, et quatre fois plus avec un emplacement de sort de niveau 9.<br>"
	},
	{
		name: "Invocation d'élémentaire",
		originalName: "Conjure Elemental",
		castedBy: [
			"druid",
			"wizard"
		],
		id: "bd9b0072-82dc-4cb2-aeaa-972854178f5a",
		level: 5,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 minute",
		range: "27 mètres",
		components: "V, S, M (de l'encens allumé pour l'air, de l'argile malléable pour la terre, du soufre et du phosphore pour le feu, ou de l'eau et du sable pour l'eau)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous invoquez un serviteur élémentaire. Choisissez une zone cubique de 3 mètres d'arête remplie d'air, de terre, de feu ou d'eau et à portée. Un élémentaire de FP 5 ou inférieur, approprié à la zone, apparaît dans un espace inoccupé dans un rayon de 3 mètres autour de cette zone. Par exemple, un élémentaire du feu surgira d'un bûcher, et un élémentaire de la terre émergera du sol. L'élémentaire disparaît lorsqu'il tombe à 0 point de vie ou lorsque le sort prend fin. L'élémentaire a une attitude amicale envers vous et vos compagnons pour la durée du sort. Lancez l'initiative pour l'élémentaire ; il a ses propres tours de jeu. Il obéit aux ordres verbaux que vous lui donnez (aucune action n'est requise de votre part). Si vous ne lui donnez aucun ordre, l'élémentaire ne fait que se défendre contre les créatures qui lui sont hostiles.<br>Si votre concentration est brisée, l'élémentaire ne disparaît pas, mais vous perdez le contrôle de l'élémentaire. Il devient hostile envers vous et vos compagnons, et peut même vous attaquer. Vous ne pouvez pas renvoyer un élémentaire incontrôlé, il disparaîtra 1 heure après son invocation. Le MD possède les statistiques de l'élémentaire.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 6 ou supérieur, le FP de l'élémentaire invoqué augmente de 1 pour chaque niveau d'emplacement au-delà du niveau 5.<br>"
	},
	{
		name: "Invocation d'élémentaires mineurs",
		originalName: "Conjure Minor Elementals",
		castedBy: [
			"druid",
			"wizard"
		],
		id: "fe4c0cb6-9d5a-403c-9e99-effa2394efcf",
		level: 4,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 minute",
		range: "27 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous invoquez les élémentaires qui apparaissent dans un espace inoccupé à portée, que vous pouvez voir. Vous choisissez l'une des options d'apparition suivantes&nbsp;:<br>• Un élémentaire de FP 2 ou inférieur<br>• Deux élémentaires de FP 1 ou inférieur<br>• Quatre élémentaires de FP 1/2 ou inférieur<br>• Huit élémentaires de FP 1/4 ou inférieur<br>Un élémentaire invoqué par ce sort disparaît lorsqu'il tombe à 0 point de vie ou lorsque le sort prend fin.<br>Les créatures invoquées ont une attitude amicale envers vous et vos compagnons. Lancez l'initiative pour le groupe de créatures invoquées ; il a ses propres tours de jeu. Elles obéissent aux ordres verbaux que vous leur donnez (aucune action n'est requise de votre part). Si vous ne leur donnez aucun ordre, elles ne font que se défendre contre les créatures qui leur sont hostiles. Le MD possède les statistiques des créatures.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant certains niveaux d'emplacements de sorts supérieurs, vous choisissez l'une des options d'invocations ci-dessus, et un nombre plus important de créatures apparaîtra ; deux fois plus avec un emplacement de sort de niveau 6 et trois fois plus avec un emplacement de sort de niveau 8.<br>"
	},
	{
		name: "Invocation d'êtres sylvestres",
		originalName: "Conjure Woodland Beings",
		castedBy: [
			"druid",
			"ranger"
		],
		id: "abf0624d-9d1a-455c-a755-a9fa2bcbbc1d",
		level: 4,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (une baie sacrée par créature invoquée)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous invoquez des créatures de type fée qui apparaissent dans un espace inoccupé que vous pouvez voir et à portée. Choisissez l'une des options d'invocation suivantes&nbsp;:<br>• Une fée de FP 2 ou inférieur<br>• Deux fées de FP 1 ou inférieur<br>• Quatre fées de FP 1/2 ou inférieur<br>• Huit fées de FP 1/4 ou inférieur<br>Une créature invoquée disparaît lorsqu'elle tombe à 0 point de vie ou lorsque le sort se termine.<br>Les créatures invoquées ont une attitude amicale envers vous et vos compagnons. Lancez l'initiative pour le groupe de créatures invoquées ; il a ses propres tours de jeu. Elles obéissent aux ordres verbaux que vous leur donnez (aucune action n'est requise de votre part). Si vous ne leur donnez aucun ordre, elles ne font que se défendre contre les créatures qui leur sont hostiles. Le MD possède les statistiques des créatures.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant des niveaux d'emplacements de sorts supérieurs, vous choisissez l'une des options d'invocation ci-dessus, et un nombre plus important de créatures apparaîtra ; deux fois plus avec un emplacement de sort de niveau 6 et trois fois plus avec un emplacement de sort de niveau 8.<br>"
	},
	{
		name: "Invocation de fée",
		originalName: "Conjure Fey",
		castedBy: [
			"druid",
			"warlock"
		],
		id: "b3730243-5a6e-4d51-ba51-12b0484dba29",
		level: 6,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 minute",
		range: "27 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous invoquez une créature de type fée de FP 6 ou inférieur, ou un esprit féérique qui prend la forme d'une bête de FP 6 ou inférieur. Elle apparaît dans un espace inoccupé que vous pouvez voir et à portée. La fée disparaît lorsqu'elle tombe à 0 point de vie ou lorsque le sort prend fin.<br>La fée a une attitude amicale envers vous et vos compagnons pour la durée du sort. Lancez l'initiative pour la fée ; elle a ses propres tours de jeu. Elle obéit aux ordres verbaux que vous lui donnez (aucune action n'est requise de votre part), tant qu'ils ne sont pas en contradiction avec son alignement. Si vous ne lui donnez aucun ordre, la fée ne fait que se défendre contre les créatures qui lui sont hostiles.<br>Si votre concentration est interrompue, la fée ne disparaît pas. Au lieu de cela, vous perdez le contrôle de la créature, elle devient hostile envers vous et vos compagnons, et peut vous attaquer. Vous ne pouvez pas renvoyer une fée que vous ne contrôlez plus. Elle disparaît 1 heure après que vous l'ayez invoquée. Le MD possède les statistiques de la fée.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 7 ou supérieur, le FP augmente de 1 pour chaque niveau d'emplacement au-delà du niveau 6.<br>"
	},
	{
		name: "Lame de feu",
		originalName: "Flame Blade",
		castedBy: [
			"druid"
		],
		id: "3e3c0ab3-81a2-45dc-8377-328f94c41d6a",
		level: 2,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V, S, M (une feuille de sumac)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous créez une lame ardente dans votre main libre. La lame est similaire en taille et en forme à un cimeterre, et reste jusqu'à ce que le sort prenne fin. Si vous lâchez l'arme, elle disparaît, mais vous pouvez la réinvoquer par une action bonus.<br>Vous pouvez utiliser votre action pour faire une attaque au corps à corps avec un sort avec la lame ardente. Si le coup touche, la cible subit 3d6 dégâts de feu.<br>La lame enflammée émet une lumière vive dans un rayon de 3 mètres et une lumière faible sur 3 mètres supplémentaires.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, les dégâts augmentent de 1d6 tous les 2 niveaux d'emplacement au-dessus du niveau 2.<br>"
	},
	{
		name: "Liane avide",
		originalName: "Grasping Vine",
		castedBy: [
			"druid",
			"ranger"
		],
		id: "3fcb899f-b20f-476b-a3cf-3a00c286dac1",
		level: 4,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "9 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous invoquez une liane qui surgit du sol dans un emplacement inoccupé de votre choix, que vous pouvez voir et qui est à portée. Lorsque vous lancez ce sort, vous pouvez faire en sorte que la liane fouette une créature située à 9 mètres ou moins d'elle et que vous pouvez voir. La créature doit réussir un jet de sauvegarde de Dextérité sous peine d'être tirée de 6 mètres en direction de la liane.<br>Jusqu'à ce que le sort prenne fin, vous pouvez diriger la liane pour qu'elle fouette la même créature, ou une autre créature, par une action bonus à chacun de vos tours.<br>"
	},
	{
		name: "Lien avec une bête",
		originalName: "Beast Bond Lien avec les bêtes",
		castedBy: [
			"druid",
			"ranger"
		],
		id: "e25d3938-4633-43dd-8ad8-de9d4c713211",
		level: 1,
		school: "divination",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (un morceau de fourrure enveloppé dans un linge)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous établissez un lien télépathique avec une bête que vous touchez, qui est amicale ou que vous avez charmée. Le sort échoue si l'Intelligence de la bête est de 4 ou plus. Jusqu'à la fin du sort, le lien est actif tant que vous et la bête êtes à portée de vue. Via le lien, la bête peut comprendre vos messages télépathiques, et elle peut communiquer par télépathie ses émotions et des concepts simples en retour. Tant que le lien est actif, la bête à un avantage à ses jets attaque contre toute créature à 1,50 mètre de vous et que vous pouvez voir.<br>"
	},
	{
		name: "Maelström",
		originalName: "Maelstrom",
		castedBy: [
			"druid"
		],
		id: "465267be-7769-4d17-8264-f90f9ffba18e",
		level: 5,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (un papier ou une feuille en forme d'entonnoir)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Une masse d'eau de 1,50 mètre de profondeur apparaît et tourbillonne dans un rayon de 9 mètres centré sur un point que vous pouvez voir dans la portée du sort. Le point doit se situer sur le sol ou dans un plan d'eau. Jusqu'à ce que le sort se termine, cette région est un terrain difficile, et toute créature qui y débute son tour doit effectuer un jet de sauvegarde de Force. En cas d'échec, elle subit 6d6 dégâts contondants et est tirée de 3 mètres vers le centre.<br>"
	},
	{
		name: "Marche sur le vent",
		originalName: "Wind Walk Vent divin",
		castedBy: [
			"druid"
		],
		id: "9edd64e0-2ac9-4182-842e-3841c014e8fb",
		level: 6,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 minute",
		range: "9 mètres",
		components: "V, S, M (du feu et de l'eau bénite)",
		duration: "8 heures",
		description: "Vous et jusqu'à 10 créatures consentantes que vous pouvez voir et à portée, êtes transformés en vapeur pour la durée du sort, ressemblant à de petits nuages. Tant qu'elle est sous cette forme de nuage, une créature obtient une vitesse de vol de 90 mètres ainsi que la résistance aux dégâts des armes non magiques. Les seules actions que peut effectuer une créature sous cette forme sont l'action Foncer et le retour à sa forme normale. Revenir à sa forme normale prend 1 minute, durant laquelle la créature est incapable d'agir et ne peut pas se déplacer. Jusqu'à la fin du sort, une créature peut revenir en forme nuageuse, ce qui lui prendra également 1 minute de transformation.<br>Si une créature est sous forme nuageuse et en train de voler lorsque l'effet prend fin, la créature redescend à la vitesse de 18 mètres par round pendant 1 minute jusqu'à ce qu'elle touche terre, ce qu'elle fait sans encombre. Si elle ne touche pas le sol après 1 minute, la créature chute de la distance restante.<br>"
	},
	{
		name: "Mur d'eau",
		originalName: "Wall of Water",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "13cbfc23-cb7b-4715-8d0f-693847559b2b",
		level: 3,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (une goutte d'eau)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous créez un mur d'eau sur le sol, à un point que vous pouvez voir à portée. Vous pouvez créer un mur mesurant jusqu'à 9 mètres de long, 3 mètres de haut et 30 cm d'épaisseur, ou vous pouvez faire un mur circulaire mesurant jusqu'à 6 mètres de diamètre, 6 mètres de haut et 30 cm d'épaisseur. Le mur disparaît quand le sort se termine. L'espace occupé par le mur est un terrain difficile.<br>Toute attaque à distance avec une arme qui entre dans l'espace du mur à un désavantage au jet d'attaque, et tous les dégâts de feu sont réduits de moitié si l'effet de feu traverse le mur pour atteindre son objectif. Les sorts infligeant des dégâts de froid qui traversent la paroi transforment en glace solide la zone du mur impactée (au minimum un carré de 1,50 mètre est gelé). Chaque section gelée de 1,50 mètre de côté a 15 pv et une CA de 5. Réduire les points de vie d'une section gelée à 0 la détruit. Lorsqu'une section est détruite, l'eau du mur ne le remplit pas.<br>"
	},
	{
		name: "Mur d'épines",
		originalName: "Wall of Thorns",
		castedBy: [
			"druid"
		],
		id: "a802f6f9-fe3a-4feb-8e40-d05765fec87f",
		level: 6,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (une poignée d'épines)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous créez un mur résistant mais souple de broussailles enchevêtrées et hérissées d'aiguilles acérées. Le mur apparaît sur une surface solide à portée et reste en place pendant toute la durée du sort. Vous pouvez choisir de créer un mur long de 18 mètres, haut de 3 mètres et épais de 1,50 mètre, ou bien un mur circulaire de 6 mètres de diamètre, d'une hauteur maximale de 6 mètres et de 1,50 mètre d'épaisseur. Le mur bloque la vue.<br>Lorsque le mur apparaît, chaque créature se trouvant dans la zone doit effectuer un jet de sauvegarde de Dextérité, subissant 7d8 dégâts perforants en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br>Une créature peut se déplacer au travers du mur, quoique lentement et difficilement. Pour chaque mètre de progression la créature doit dépenser 4 mètres de déplacement. Par ailleurs, la première fois du tour qu'une créature entre dans le mur ou y termine son tour, elle doit effectuer un jet de sauvegarde de Dextérité, subissant 7d8 dégâts tranchants en cas d'échec, ou la moitié de ces dégâts en cas de réussite.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 7 ou supérieur, les deux types de dégâts sont augmentés de 1d8 pour chaque niveau d'emplacement au-delà du niveau 6.<br>"
	},
	{
		name: "Mur de feu",
		originalName: "Wall of Fire",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "50fa3b36-62cc-4a86-b698-97abaae12977",
		level: 4,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (un petit morceau de phosphore)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous créez un mur de flammes sur une surface solide dans la portée du sort. Vous pouvez façonner le mur jusqu'à 18 mètres de longueur, 6 mètres de hauteur et 30 cm d'épaisseur. Vous pouvez également en faire un mur circulaire de 6 mètres de diamètre, 6 mètres de hauteur et 30 cm d'épaisseur. Le mur est opaque et persiste pour la durée du sort.<br>Lorsque le mur apparaît, chaque créature dans la zone doit effectuer un jet de sauvegarde de Dextérité, subissant 5d8 dégâts de feu en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br>Un côté du mur, que vous déterminez lors de l'incantation du sort, inflige 5d8 dégâts de feu à chaque créature qui termine son tour à 3 mètres ou moins de ce côté ou à l'intérieur du mur. Une créature subit les mêmes dégâts lorsqu'elle pénètre dans le mur pour la première fois lors d'un tour ou lorsqu'elle y termine son tour.<br>L'autre côté du mur n'inflige aucun dégât.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 5 ou supérieur, les dégâts du sort augmentent de 1d8 pour chaque niveau d'emplacement au-delà du niveau 4.<br>"
	},
	{
		name: "Mur de vent",
		originalName: "Wind Wall",
		castedBy: [
			"druid",
			"ranger"
		],
		id: "ad5e186c-f577-4dc9-9707-2d28e97141a1",
		level: 3,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (un minuscule éventail et une plume d'oiseau exotique)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Un mur de puissants vents s'élève du sol à un endroit de votre choix. Vous pouvez créer un mur pouvant faire, au mieux, 15 mètres de long, 4,50 mètres de haut et 30 cm d'épaisseur. Vous pouvez donner au mur la forme que vous souhaitez, à condition qu'il soit continuellement en contact avec le sol. Le mur reste en place pour toute la durée du sort.<br>Lorsque le mur apparaît, chaque créature se trouvant dans la zone doit effectuer un jet de sauvegarde de Force. Une créature subit 3d8 dégâts contondants en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br>Le vent violent garde les brumes, brouillards, et autres gaz éloignés. Les objets et créatures volants de taille P ou inférieure ne peuvent pas passer au travers du mur. S'ils ne sont pas tenus ou fixés, les objets légers amenés dans le mur s'envolent. Les flèches, carreaux et autres projectiles ordinaires tirés en direction de cibles situées de l'autre côté du mur sont détournés et automatiquement perdus (les rochers projetés par des géants ou des engins de siège, ou tout autre projectile similaire, ne sont pas affectés). Les créatures sous forme gazeuse ne peuvent pas traverser le mur de vent.<br>"
	},
	{
		name: "Nappe de brouillard",
		originalName: "Fog Cloud",
		castedBy: [
			"druid",
			"ranger",
			"sorcerer",
			"wizard"
		],
		id: "fc7ef19d-7d83-4efe-9b19-838a8b14e426",
		level: 1,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous créez une sphère de brouillard de 6 mètres de rayon centrée sur un point dans la portée du sort. La sphère s'étend au-delà des coins et la visibilité dans la zone est nulle. Elle persiste pour la durée du sort ou jusqu'à ce qu'un vent de force modérée ou plus (au moins 15 km/h) la dissipe.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, le rayon de la sphère augmente de 6 mètres pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Ossements de la Terre",
		originalName: "Bones of the Earth",
		castedBy: [
			"druid"
		],
		id: "7a6f338c-d897-471c-a4ce-64adaf834170",
		level: 6,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous provoquez l'apparition de piliers de pierre, jusqu'à 6, à des endroits que vous pouvez voir dans la portée du sort. Chaque pilier est un cylindre qui a un diamètre de 1,50 mètre et une hauteur de 9 mètres maximum. L'endroit où apparaît un pilier doit être assez large pour son diamètre, et vous pouvez cibler le sol sous une créature si cette créature est de taille M ou plus petite. Chaque pilier a une CA de 5 et 30 points de vie. Si un pillier est réduit à 0 point de vie, il tombe en ruines, ce qui crée une zone de terrain difficile dans un rayon de 3 mètres. Les décombres restent jusqu'à ce qu'ils soient nettoyés. Chaque portion de la zone de 1,50 mètre de diamètre nécessite au moins 1 minute pour être nettoyée à la main.<br>Si l'un des piliers est créé sous une créature, cette créature doit réussir un jet de sauvegarde de Dextérité ou être soulevée par le pilier. Une créature peut choisir de rater le jet.<br>Si l'un des piliers ne peut atteindre sa pleine hauteur en raison d'un plafond ou de tout autre obstacle, une créature sur le pilier subit 6d6 dégâts contondants et est entravée, coincée entre le pilier et l'obstacle. La créature entravée peut utiliser une action pour faire un jet de Force ou de Dextérité (au choix de la créature) contre le DD de sauvegarde du sort. En cas de réussite, la créature n'est plus entravée et doit soit descendre du pilier, soit en tomber.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 7 ou supérieur, vous pouvez créer deux piliers supplémentaires pour chaque niveau d'emplacement au-delà du niveau 7.<br>"
	},
	{
		name: "Passage par les arbres",
		originalName: "Tree Stride",
		castedBy: [
			"druid",
			"ranger"
		],
		id: "a25a21b8-e02a-4e1d-bb83-b7e78c08d742",
		level: 5,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous gagnez la capacité de pénétrer dans un arbre et de vous déplacer à l'intérieur pour ressortir par un autre arbre de la même espèce se trouvant à 150 mètres maximum. Les deux arbres doivent être vivants et être au moins aussi grands que vous. Vous devez utiliser 1,50 mètre de votre mouvement pour entrer dans l'arbre. Vous connaissez immédiatement l'emplacement de tous les autres arbres de la même espèce se trouvant à 150 mètres à la ronde et, faisant partie du mouvement que vous avez utilisé pour pénétrer dans l'arbre, vous pouvez vous déplacer à l'intérieur d'un autre arbre ou sortir de l'arbre dans lequel vous êtes. Vous apparaissez à l'endroit de votre choix à 1,50 mètre de l'arbre de destination en dépensant 1,50 mètre de mouvement supplémentaire. S'il ne vous reste plus de mouvement à dépenser, vous apparaissez à 1,50 mètre de l'arbre par lequel vous êtes entré.<br>Vous pouvez utiliser ce moyen de transport une fois par tour pendant toute la durée du sort. Vous devez terminer chacun de vos tours en dehors d'un arbre.<br>"
	},
	{
		name: "Passage sans trace",
		originalName: "Pass without Trace",
		castedBy: [
			"druid",
			"ranger"
		],
		id: "1388b2a3-e83a-4b36-924a-330bd26dcfdf",
		level: 2,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (les cendres de la combustion d'une feuille de gui et d'une brindille d'épinette)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Un voile d'ombres et de silence émane de vous, vous protégeant, ainsi que vos compagnons, de la détection. Pour la durée du sort, chaque créature que vous choisissez et se trouvant à 9 mètres de vous (vous y compris) a un bonus de +10 aux jets de Dextérité (Discrétion) et ne peut pas être pistée, sauf par des moyens magiques. Une créature qui reçoit ce bonus ne laisse ni piste ni trace de son passage.<br>"
	},
	{
		name: "Peau d'écorce",
		originalName: "Barkskin",
		castedBy: [
			"druid",
			"ranger"
		],
		id: "c6f07dce-c63b-40e2-897c-96c9af9b2ac6",
		level: 2,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (une poignée d'écorce de chêne)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous touchez une créature consentante. Jusqu'à la fin du sort, la peau de la cible prend une texture rugueuse telle l'écorce d'un arbre et la CA de la cible ne peut être inférieure à 16, peu importe le type d'armure qu'elle porte.<br>"
	},
	{
		name: "Protection primordiale",
		originalName: "Primordial Ward",
		castedBy: [
			"druid"
		],
		id: "83078454-3595-4bf2-b6dd-ae22d4f83330",
		level: 6,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous obtenez la résistance aux dégâts d'acide, froid, feu, radiant et tonnerre pour la durée du sort.<br>Si vous subissez des dégâts d'un type pré-cité, vous pouvez utiliser votre réaction pour obtenir l'immunité à ces dégâts, y compris contre des dégâts à déclenchement. Dans ce cas, vous perdez toutes vos résistances aux dégâts et gagnez l'immunité choisie jusqu'à la fin de votre prochain tour, au terme duquel le sort prend fin.<br>"
	},
	{
		name: "Rafale de vent",
		originalName: "Gust",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "60a85558-bcc1-427a-a8d9-e228cf19a968",
		level: 0,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous saisissez l'air et l'obligez à créer un des effets suivants à un point que vous pouvez voir à portée :<br>• Une créature de taille M ou plus petite que vous choisissez doit réussir un jet de sauvegarde de Force ou être repoussée de 1,50 mètre de vous.<br>• Vous créez une petite explosion d'air capable de bouger un objet qui n'est pas tenu ni porté et qui ne pèse pas plus que 2,5 kg. L'objet est repoussé de 3 mètres. Il n'est pas poussé avec assez de force pour faire des dégâts.<br>• Vous créez un effet sensoriel inoffensif qui utilise l'air, comme provoquer le bruissement de feuilles, faire claquer des volets ou faire onduler des vêtements dans une brise.<br>"
	},
	{
		name: "Rayon de lune",
		originalName: "Moonbeam",
		castedBy: [
			"druid"
		],
		id: "a65ad251-ddf9-4d8c-9e45-f7c912fcb782",
		level: 2,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (plusieurs graines de pavot et un morceau de feldspath opalescent)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Un rayon argenté de lumière pâle brille dans un cylindre de 12 mètres de haut et 1,50 mètre de rayon, centré sur un point à portée. Jusqu'à ce que le sort prenne fin, une lumière faible remplit le cylindre.<br>Lorsqu'une créature pénètre la zone d'effet du sort pour la première fois dans un tour, ou qu'elle y débute son tour, elle est enveloppée de flammes fantomatiques qui lui provoquent d'intenses douleurs, l'obligeant à effectuer un jet de sauvegarde de Constitution. Elle subit 2d10 dégâts radiants en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br>Un métamorphe effectue son jet de sauvegarde avec un désavantage. S'il échoue, il est également forcé de retrouver sa forme originelle et ne peut pas prendre une forme différente tant qu'il n'a pas échappé à la lueur produite par le sort.<br>À chacun de vos tours après que vous ayez lancé ce sort, vous pouvez utiliser votre action pour déplacer le rayon jusqu'à 18 mètres dans n'importe quelle direction.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, les dégâts augmentent de 1d10 pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Rayon de soleil",
		originalName: "Sunbeam",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "217bff17-6e6d-428a-b657-fbcadb8060ae",
		level: 6,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (ligne de 18 mètres)",
		components: "V, S, M (une loupe)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Un rayon de lumière intense est émis de votre main sur une ligne de 18 mètres de long et de 1,50 mètre de large. Chaque créature se trouvant sur cette ligne doit effectuer un jet de sauvegarde de Constitution. En cas d'échec, une créature subit 6d8 dégâts radiants et est aveuglée jusqu'à votre prochain tour. En cas de réussite, elle subit la moitié de ces dégâts et n'est pas aveuglée par ce sort. Les morts-vivants et les vases ont un désavantage pour ce jet de sauvegarde.<br>Vous pouvez créer une nouvelle ligne de lumière par une action, à chacun de vos tours, jusqu'à ce que le sort prenne fin.<br>Pour toute la durée du sort, un point de lumière intense brille dans votre main. Il répand une lumière vive dans un rayon de 9 mètres et une lumière faible sur 9 mètres supplémentaires. Cette lumière est équivalente à celle du soleil.<br>"
	},
	{
		name: "Raz-de-marée",
		originalName: "Tidal Wave",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "1d9d2892-da19-451f-9f63-94074d37ec5e",
		level: 3,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (une goutte d'eau)",
		duration: "instantanée",
		description: "Vous conjurez une vague d'eau qui s'écrase sur une zone à portée. La zone peut mesurer jusqu'à 9 mètres de long, 3 mètres de large et 3 mètres de haut. Chaque créature dans la portée du sort doit faire un jet de sauvegarde de Dextérité. En cas d'échec, la créature subit 4d8 dégâts contondants et tombe à terre. En cas de réussite, la créature subit la moitié de ces dégâts et ne tombe pas à terre. L'eau se propage ensuite à travers le sol dans toutes les directions, éteignant toute flamme non protégée dans sa zone et dans les 9 mètres autour, puis disparait.<br>"
	},
	{
		name: "Réincarnation",
		originalName: "Reincarnate",
		castedBy: [
			"druid"
		],
		id: "5672113d-87ed-4860-bc00-9f4446eb91d1",
		level: 5,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 heure",
		range: "contact",
		components: "V, S, M (des huiles et des onguents rares valant au moins 1 000 po, que le sort consomme)",
		duration: "instantanée",
		description: "Vous touchez un humanoïde mort ou une partie de cet humanoïde mort. À condition que l'humanoïde ne soit pas mort depuis plus de 10 jours, le sort crée un nouveau corps adulte pour cet humanoïde et appelle son âme pour qu'elle entre dans ce corps. Si l'âme de la cible n'est pas libre, ou si elle n'en a pas envie, le sort échoue.<br>La magie façonne un nouveau corps pour que la créature s'y installe, ce qui fait que la race de la créature peut changer. Le MD lance 1d100 et consulte la table ci-dessous pour déterminer quelle forme va prendre la créature lorsqu'elle reviendra à la vie, le MD peut sinon choisir la forme du corps.<br><table><tbody><tr><th class=\"center\">d100</th><th>Race</th></tr><tr><td class=\"center\">01-04</td><td>Drakéide</td></tr><tr><td class=\"center\">05-13</td><td>Nain des collines</td></tr><tr><td class=\"center\">14-21</td><td>Nain des montagnes</td></tr><tr><td class=\"center\">22-25</td><td>Elfe noir</td></tr><tr><td class=\"center\">26-34</td><td>Haut-elfe</td></tr><tr><td class=\"center\">35-42</td><td>Elfe des bois</td></tr><tr><td class=\"center\">43-46</td><td>Gnome des forêts</td></tr><tr><td class=\"center\">47-52</td><td>Gnome des roches</td></tr><tr><td class=\"center\">53-56</td><td>Demi-elfe</td></tr><tr><td class=\"center\">57-60</td><td>Demi-orc</td></tr><tr><td class=\"center\">61-68</td><td>Halfelin pied-léger</td></tr><tr><td class=\"center\">69-76</td><td>Halfelin robuste</td></tr><tr><td class=\"center\">77-96</td><td>Humain</td></tr><tr><td class=\"center\">97-00</td><td>Tieffelin</td></tr></tbody></table><br>La créature réincarnée se rappelle de sa vie passée. Elle conserve les capacités qu'elle possédait sous son ancienne forme ; elle change cependant de race, et change donc de traits raciaux en conséquence.<br>"
	},
	{
		name: "Sacre de la glace",
		originalName: "Investiture of Ice",
		castedBy: [
			"druid",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "0f100606-03f0-473d-92f1-ecf168db9686",
		level: 6,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "concentration, jusqu'a 10 minutes",
		description: "Jusqu'à la fin du sort, la glace givre votre corps et vous bénéficiez des avantages suivants :<br>• Vous êtes immunisé contre les dégâts de froid et acquérez une résistance contre les dégâts de feu.<br>• Vous pouvez vous déplacer sur des terrains difficiles dus au froid et à la glace sans être affecté.<br>• Le sol dans un rayon de 3 mètres autour de vous est verglacé et devient un terrain difficile pour toutes les créatures excepté pour vous. Cette zone bouge avec vous.<br>• Vous pouvez utiliser votre action pour créer un cône de 4,50 mètres s'étendant de vos mains tendues vers une direction choisie. Chaque créature dans le cône doit faire un jet de sauvegarde de Constitution, subissant 4d6 dégâts de froid en cas d'échec, ou la moitié de ces dégâts en cas de réussite. Une créature qui rate son jet de sauvegarde contre cet effte voit son mouvement être divisé par deux jusqu'à la fin de votre prochain tour.<br>"
	},
	{
		name: "Sacre de la pierre",
		originalName: "Investiture of Stone",
		castedBy: [
			"druid",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "82c7a570-0fcc-44b3-a79c-14e50a67aded",
		level: 6,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "concentration, jusqu'a 10 minutes",
		description: "Jusqu'à la fin du sort, votre corps se recouvre de pierre et vous bénéficiez des avantages suivants :<br>• Vous acquérez une résistance contre les dégâts contondants, perforants et tranchants provenant d'attaques non magiques.<br>• Vous pouvez utiliser votre action pour créer un petit séisme dans un rayon de 4,50 mètres centré sur vous. Toutes les créatures évoluant sur ce sol doivent réussir un jet de sauvegarde de Dextérité ou être projetée à terre.<br>• Vous pouvez vous déplacer sur des terrains difficiles faits de terre et de roche sans être affecté. Vous pouvez traverser la terre et la roche comme si c'était de l'air et sans les déstabiliser, mais vous ne pouvez pas vous y arrêter. Si vous le faites, vous êtes éjecté vers l'espace inoccupé le plus proche, ce sort se termine et vous êtes étourdi jusqu'à la fin de votre prochain tour.<br>"
	},
	{
		name: "Sacre des flammes",
		originalName: "Investiture of Flame",
		castedBy: [
			"druid",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "cdc2c415-fd78-4f69-8c59-baa07be0ab9d",
		level: 6,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Les flammes courent sur votre corps et répandent, pour la durée du sort, une lumière vive sur 9 mètres de rayon et une lumière faible sur 9 mètres supplémentaires. Ces flammes ne vous blessent pas. Jusqu'à la fin du sort vous bénéficiez des avantages suivants :<br>• Vous êtes immunisé contre les dégâts de feu et acquérez une résistance contre les dégâts de froid.<br>• Toute créature qui pour la première fois dans un tour bouge dans une zone de 1,50 mètre autour de vous, ou y finit son tour, prend 1d10 dégâts de feu.<br>• Vous pouvez utiliser votre action pour créer une ligne de feu de 4,50 mètres de long et 1,50 mètre de large s'étendant à partir de vous vers une direction de votre choix. Chaque créature dans la ligne de mire doit faire un jet de sauvegarde de Dextérité, subissant 4d8 dégâts de feu en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br>"
	},
	{
		name: "Sacre du vent",
		originalName: "Investiture of Wind",
		castedBy: [
			"druid",
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "80a37e77-e53c-4b33-8805-3ced9cd75f8e",
		level: 6,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "concentration, jusqu'a 10 minutes",
		description: "Jusqu'à la fin du sort le vent tourbillonne autour de vous et vous bénéficiez des avantages suivants :<br>• Les attaques contre vous avec des armes à distance se font avec un désavantage.<br>• Vous obtenez une vitesse de vol de 18 mètres. Si vous êtes en train de voler lorsque le sort cesse vous tombez, à moins que vous ne puissiez l'empêcher d'une façon ou d'une autre.<br>• Vous pouvez utiliser votre action pour créer un cube de 4,50 mètres d'arête de vent tourbillonnant ayant pour centre un point visible distant de 18 mètres maximum. Toute créature se trouvant dans cette zone doit faire un jet de sauvegarde de Constitution, subissant 2d10 dégâts contondants en cas d'échec, ou la moitié de ces dégâts en cas de réussite. Si une créature de taille G ou inférieure rate son jet de sauvegarde, elle est également repoussée de jusqu'à 3 mètres du centre du cube.<br>"
	},
	{
		name: "Sauvagerie primitive",
		originalName: "Primal Savagery",
		castedBy: [
			"druid"
		],
		id: "378c1761-fb0a-4670-8092-3a13cf32a552",
		level: 0,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "S",
		duration: "instantanée",
		description: "Vous canalisez la magie primale pour qu'elle aiguise vos dents ou vos ongles, le rendant prêts à livrer une attaque corrosive. Réalisez une attaque au corps à corps avec un sort contre une créature située à 1,50 mètre ou moins de vous. En cas de réussite, la cible prend 1d10 dégâts d'acide. Après que vous ayez effectué votre attaque, vos dents ou vos ongles reprennent leur état normal.<br>Les dégâts du sort augmentent de 1d10 lorsque vous atteignez le niveau 5 (2d10), le niveau 11 (3d10) et le niveau 17 (4d10).<br>"
	},
	{
		name: "Sens animal",
		originalName: "Beast Sense",
		castedBy: [
			"druid",
			"ranger"
		],
		id: "1c11c0ef-707d-41f4-9733-6030f3349369",
		level: 2,
		school: "divination",
		isRitual: true,
		castingTime: "1 action",
		range: "contact",
		components: "S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous touchez une bête consentante. Pour la durée du sort, vous pouvez utiliser votre action pour voir à travers les yeux de la bête et entendre ce qu'elle entend. Vous pouvez continuer jusqu'à ce que vous utilisiez une action pour retrouver vos propres sens. Lorsque vous percevez par l'intermédiaire des sens de la bête, vous bénéficiez des sens spéciaux que possède la créature. Cependant, vous perdez l'usage de vos propres sens.<br>"
	},
	{
		name: "Sphère aqueuse",
		originalName: "Watery Sphere",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "ba8c8fb8-210c-4b39-af02-e8e2cb120e58",
		level: 4,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (une goutte d'eau)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous invoquez une sphère d'eau d'un rayon de 1,50 mètre centrée sur un point que vous pouvez voir à portée. La sphère peut faire du vol stationnaire, mais pas à plus de 3 mètres du sol. La sphère perdure pour la durée du sort.<br>Toute créature dans l'espace de la sphère doit faire un jet de sauvegarde de Force. En cas de réussite, la créature est éjectée de cet espace vers l'espace libre le plus proche en dehors de la sphère, au choix de la créature. Une créature de taille TG ou plus réussit le jet de sauvegarde automatiquement, et une créature de taille G ou inférieure peut délibérement choisir de rater le jet. En cas d'échec, une créature est entravée par la sphère et est engloutie par l'eau. À la fin de chacun de ses tours, une cible entravée peut répéter le jet de sauvegarde, mettant fin à l'effet sur elle-même en cas de réussite.<br>La sphère peut entraver un maximum de quatre créatures de taille M ou plus petites ou une créature de taille G. Si la sphère entrave une créature avec pour conséquence qu'elle excède sa capacité, une créature au hasard qui est déjà entravée par la sphère en tombe et se retrouve à terre à 1,50 mètre de celle-ci.<br>En tant qu'action, vous pouvez déplacer la sphère jusqu'à 9 mètres en ligne droite. Si elle se déplace au dessus d'une fosse, d'une falaise ou de tout autre dénivelé, elle descend en toute sécurité jusqu'à ce qu'elle soit en vol stationnaire à 3 mètres au dessus du sol. Toute créature entravée par la sphère se déplace avec elle. Vous pouvez viser des créatures avec la sphère, les forçant à faire un jet de sauvegarde.<br>Quand le sort se termine, la sphère tombe au sol et éteint toutes les flammes normales dans un rayon de 9 mètres. Toute créature entravée par la sphère se retrouve à terre dans l'espace où elle tombe. Puis l'eau disparait.<br>"
	},
	{
		name: "Sphère de feu",
		originalName: "Flaming Sphere",
		castedBy: [
			"druid",
			"wizard"
		],
		id: "ec665e5c-cc1e-4201-902a-4c3f8431a655",
		level: 2,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (un peu de suif, une pincée de soufre et de la poussière de poudre de fer)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Une sphère de feu d'un diamètre de 1,50 mètre apparait dans un espace inoccupé de votre choix dans la portée et pour la durée du sort. Toute créature qui termine son tour à 1,50 mètre ou moins de la sphère doit effectuer un jet de sauvegarde de Dextérité, subissant 2d6 dégâts de feu en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br>Avec une action bonus, vous pouvez déplacer la sphère jusqu'à 9 mètres. Si la sphère entre en collision avec une créature, celle-ci doit faire un jet de sauvegarde contre les dégâts de la sphère et elle arrête son mouvement pour ce tour.<br>Lorsque vous déplacez la sphère, vous pouvez la diriger par-dessus des barrières de 1,50 mètre ou moins et la propulser au-dessus d'un gouffre large de 3 mètres ou moins. La sphère enflamme les objets inflammables qui ne sont pas portés ou transportés, et émet une lumière vive dans un rayon de 6 mètres et une lumière faible sur 6 mètres supplémentaires.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, les dégâts sont augmentés de 1d6 pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Tempête de grêle",
		originalName: "Ice Storm",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "89e20e78-5d3b-4fbb-9380-e03c563d59d3",
		level: 4,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "90 mètres",
		components: "V, S, M (une pincée de poussière et quelques gouttes d'eau)",
		duration: "instantanée",
		description: "Une pluie de grêle dure comme la pierre tombe au sol dans un cylindre de 6 mètres de rayon et de 12 mètres de haut centré sur le point choisi à l'intérieur de la portée du sort. Chaque créature dans le cylindre doit faire un jet de sauvegarde de Dextérité. Une créature subit 2d8 dégâts contondants et 4d6 dégâts de froid en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br>Les grêlons transforment la zone d'effet de la tempête en un terrain difficile jusqu'à la fin de votre prochain tour.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 5 ou supérieur, les dégâts contondants augmentent de 1d8 pour chaque niveau d'emplacement au-delà du niveau 4.<br>"
	},
	{
		name: "Tempête de neige",
		originalName: "Sleet Storm",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "546f9da2-6d0c-48f7-b8ea-a9f634e1f4f2",
		level: 3,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "45 mètres",
		components: "V, S, M (une pincée de poussière et quelques gouttes d'eau)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Tant que le sort persiste, une pluie glacée et de la neige tombent dans un cylindre de 6 mètres de hauteur avec un rayon de 12 mètres, centré sur un point déterminé dans la portée du sort. La visibilité dans la zone est nulle et les flammes nues dans la zone sont éteintes.<br>Le sol dans la zone est couvert de glace glissante, rendant le terrain difficile. Lorsqu'une créature pénètre dans la zone du sort pour la première fois d'un tour ou lorsqu'elle y débute son tour, elle doit réussir un jet de sauvegarde de Dextérité ou tomber à terre.<br>Si une créature commence son tour dans la zone d'effet du sort tout en étant concentrée sur un sort, elle doit réussir un jet de sauvegarde de Constitution contre le DD de sauvegarde de votre sort, sans quoi elle perd sa concentration.<br>"
	},
	{
		name: "Tempête vengeresse",
		originalName: "Storm of Vengeance",
		castedBy: [
			"druid"
		],
		id: "5c083bee-a697-40e7-9f2d-96d2be55bfdc",
		level: 9,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "champ de vision",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Des nuages orageux tourbillonnants apparaissent, centrés sur un point que vous pouvez voir et s'étalant dans un rayon de 108 mètres. Des éclairs zèbrent le ciel dans la zone, le tonnerre éclate, et de puissants vents font rage. Chaque créature située sous le nuage (à 1 500 mètres au-dessous maximum) lorsqu'il apparaît doit effectuer un jet de sauvegarde de Constitution. En cas d'échec, une créature subit 2d6 dégâts de tonnerre et est assourdie pendant 5 minutes.<br>Pour chaque round durant lequel vous maintenez votre concentration sur ce sort, la tempête produit différents effets lors de votre tour.<br><strong>Round 2</strong>. Une pluie acide tombe du nuage. Chaque créature ou objet sous le nuage subit 1d6 dégâts d'acide.<br><strong>Round 3</strong>. Vous appelez six éclairs pour qu'ils frappent chacun une créature ou un objet de votre choix et situé sous le nuage. Une créature ou un objet ne peut être ciblé par plus d'un éclair. Une créature touchée doit effectuer un jet de sauvegarde de Dextérité, subissant 10d6 dégâts de foudre en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br><strong>Round 4</strong>. Une pluie de grêlon s'abat. Chaque créature située sous le nuage subit 2d6 dégâts contondants.<br><strong>Round 5-10</strong>. Des rafales de vent et des pluies glaciales se déchaînent dans la zone sous le nuage. La zone devient un terrain difficile et est profondément obscurcie. Chaque créature qui s'y trouve subit 1d6 dégâts de froid. Les attaques à distance avec une arme sont impossibles dans la zone. Le vent et la pluie compte comme une distraction importante pour ce qui est de maintenir sa concentration sur ses sorts. Enfin, les puissantes rafales de vent (atteignant 30 à 75 km/h) dispersent automatiquement le brouillard, le brume, et tout autre phénomène similaire dans la zone, qu'ils soient naturels ou magiques.<br>"
	},
	{
		name: "Terraformage",
		originalName: "Move Earth Glissement de terrain",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "80ee6f0c-04e8-42be-bd6d-1106d79f9aa2",
		level: 6,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (une lame en fer et un mélange d'argile, de terre meuble et de sable dans un petit sac)",
		duration: "concentration, jusqu'à 2 heures",
		description: "Choisissez une superficie de terrain pas plus large que 12 mètres de côté dans la portée du sort. Vous pouvez façonner la terre, le sable ou l'argile dans la zone de la manière que vous souhaitez pour la durée du sort. Vous pouvez élever ou abaisser l'altitude de la zone, déblayer ou remblayer une tranchée, ériger ou aplatir un mur ou former un pilier. La mesure de telles modifications ne peut excéder la moitié de la dimension la plus large de la zone. Ainsi, si vous remodelez un carré de 12 mètres d'arête, vous pouvez créer un pilier de 6 mètres de hauteur, élever ou abaisser l'altitude de ce carré de 6 mètres, creuser une tranchée de 6 mètres de profondeur, et ainsi de suite. Les changements prennent 10 minutes pour s'achever.<br>À la fin de chaque période de 10 minutes que vous passez concentré sur le sort, vous pouvez terraformer une nouvelle superficie.<br>Puisque la transformation du relief s'effectue lentement, les créatures présentes dans la zone ne peuvent être piégées ou blessées par les mouvements du sol.<br>Ce sort ne peut manipuler la pierre naturelle et les constructions en pierre. La roche et les structures se déplacent pour s'accommoder au nouveau relief. Si votre terraformage place une structure en position précaire, elle pourrait s'écrouler.<br>De même, le sort n'affecte pas la croissance de la végétation. Les plantes sont transportées par le mouvement du sol.<br>"
	},
	{
		name: "Tourbillon",
		originalName: "Whirlwind",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "ba2b194a-6ea3-4412-b8c0-bdeb8fd2ff77",
		level: 7,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "90 mètres",
		components: "V, M (un morceau de paille)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Une tornade apparait sur le sol à un endroit que vous pouvez voir et dans la limite de la portée du sort. La tornade est un cylindre de 3 mètres de rayon et 9 mètres de haut centré sur ce point. Jusqu'à ce que le sort se termine, vous pouvez utiliser votre action pour déplacer la tornade jusqu'à 9 mètres dans toutes les directions au niveau du sol. Le tourbillon aspire tous les objets de taille M ou plus petits qui ne sont pas fixés et qui ne sont ni portés, ni tenus par quiconque.<br>Une créature doit faire un jet de sauvegarde de Dextérité la première fois durant un tour qu'elle pénètre dans la tornade ou quand la tornade entre dans son espace, y compris lors de la première apparition de celle-ci. Une créature subit 10d6 dégâts contondants en cas d'échec, ou la moitié de ces dégâts en cas de réussite. En outre, une créature de taille G ou plus petite qui échoue à son jet de sauvegarde doit réussir un autre jet de sauvegarde de Force ou être entravée par la tornade jusqu'à ce que le sort se termine. Quand une créature commence son tour entravée par la tornade, la créature est aspirée de 1,50 mètre vers le haut à l'intérieur de celle-ci, à moins que la créature ne soit déjà au sommet. Une créature entravée se déplace avec la tornade et tombe quand le sort se termine, à moins que la créature ait des moyens de rester en l'air.<br>Une créature entravée peut utiliser une action pour faire un jet de Force ou de Dextérité contre le DD de sauvegarde de votre sort. En cas de réussite, la créature n'est plus entravée par la tornade et est projetée à 3d6 x 1,50 mètre dans une direction aléatoire.<br>"
	},
	{
		name: "Tourbillon de poussière",
		originalName: "Dust Devil",
		castedBy: [
			"druid",
			"sorcerer",
			"wizard"
		],
		id: "ab0dbb3b-a805-47af-9d44-6708977083fe",
		level: 2,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (une pincée de poussière)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Choisissez un cube d'air visible et inoccupé de 1,50 mètre d'arête dans la portée du sort. Une force élémentaire ressemblant à un tourbillon de poussière apparait dans la zone cubique et demeure jusqu'à la fin du sort.<br>Toute créature finissant son tour à 1,50 mètre ou moins du tourbillon de poussière doit faire un jet de sauvegarde de Force. En cas d'échec, la créature prend 1d8 dégâts contondants et est repoussée de 3 mètres du tourbillon. En cas de réussite, la créature subit la moitié de ces dégâts et n'est pas repoussée.<br>Par une action bonus, vous pouvez déplacer le tourbillon de poussière jusqu'à 9 mètres dans n'importe quelle direction. Si le tourbillon de poussière se déplace sur du sable, de la poussière, de la terre meuble ou du petit gravier, il aspire ces matériaux et forme un nuage de débris de 3 mètres de rayon tout autour de lui jusqu' au début de votre prochain tour. Ce nuage rend la visibilité nulle dans la zone qu'il occupe.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, les dégâts augmentent de 1d8 pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Tsunami",
		originalName: "Tsunami",
		castedBy: [
			"druid"
		],
		id: "54173a7c-2fe0-46f0-94d6-935e28871175",
		level: 8,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 minute",
		range: "champ de vision",
		components: "V, S",
		duration: "concentration, jusqu'à 6 rounds",
		description: "Un mur d'eau apparaît en un point de votre choix, à portée. Vous pouvez créer un mur qui peut atteindre jusqu'à 90 mètres de long, 90 mètres de haut et 15 mètres d'épaisseur. Le mur reste en place pour toute la durée du sort.<br>Lorsque le mur apparaît, chaque créature se trouvant dans la zone doit effectuer un jet de sauvegarde de Force. Une créature subit 6d10 dégâts contondants en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br>Au début de chacun de vos tours après que le mur soit apparu, le mur, ainsi que toutes les créatures à l'intérieur, s'éloigne de vous en se déplaçant de 15 mètres. Toutes les créatures de taille G ou inférieure situées à l'intérieur du mur, ou le percutant lorsque celui-ci se déplace, doivent réussir un jet de sauvegarde de Force sous peine de subir 5d10 dégâts contondants. Une créature ne peut subir ces dégâts qu'une seule fois par tour.<br>À la fin du tour, la hauteur du mur est réduite de 15 mètres et les dégâts que les créatures vont subir aux rounds suivants sont réduits de 1d10. Lorsque la hauteur du mur tombe à 0, le sort prend fin.<br>Une créature piégée dans le mur peut se déplacer en nageant. Cependant, du fait de la puissance de la vague, une créature doit réussir un jet de Force (Athlétisme) contre le DD de sauvegarde de votre sort pour pouvoir se déplacer. Si elle échoue, elle ne peut pas bouger. Une créature qui se déplace en dehors de la zone d'effet tombe au sol.<br>"
	},
	{
		name: "Voie végétale",
		originalName: "Transport via Plants",
		castedBy: [
			"druid"
		],
		id: "2319737f-fdad-4225-85d8-879614ca925e",
		level: 6,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "3 mètres",
		components: "V, S",
		duration: "1 round",
		description: "Ce sort crée un lien magique entre une plante inanimée de taille G ou supérieure se trouvant à portée et une autre plante pouvant se trouver n'importe où sur le même plan d'existence. Vous devez avoir déjà vu ou touché au moins une fois la plante de destination. Pour toute la durée du sort, n'importe quelle créature peut pénétrer dans la plante ciblée et en sortir par la plante de destination en utilisant 1,50 mètre de son mouvement.<br>"
	},
	{
		name: "Appel de destrier",
		originalName: "Find Steed",
		castedBy: [
			"paladin"
		],
		id: "49ef92f0-9e75-4d75-9728-e2dff66cd162",
		level: 2,
		school: "conjuration",
		isRitual: false,
		castingTime: "10 minutes",
		range: "9 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous invoquez un esprit qui se matérialise sous la forme d'un destrier loyal, fort et remarquablement intelligent, créant un lien durable avec lui. Apparaissant dans un espace inoccupé à portée, le destrier prend la forme que vous voulez : un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=cheval-de-guerre\">cheval de guerre</a>, un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=poney\">poney</a>, un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=chameau\">chameau</a>, un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=elan\">élan</a> ou un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=molosse\">molosse</a> (votre MD peut autoriser l'invocation d'autres bêtes en tant que destriers). Le destrier a les statistiques de la forme choisie, mais son type est soit céleste, soit fée, soit fiélon (au choix) à la place de son type normal. De plus, si votre destrier a une Intelligence de 5 ou moins, son Intelligence passe à 6 et il gagne la capacité de comprendre l'une des langues que vous parlez (au choix).<br>Votre destrier vous sert de monture, en combat ou non, et le lien qui vous unit vous permet de combattre comme un seul homme. Lorsque vous montez votre destrier et que vous lancez un sort qui vous cible, vous pouvez faire en sorte qu'il cible également votre destrier.<br>Lorsque votre destrier tombe à 0 point de vie, il disparaît, ne laissant aucune forme physique. Vous pouvez également choisir de renvoyer votre destrier à tout moment en utilisant votre action. Il disparaît alors. Dans tous les cas, lancer de nouveau ce sort invoque le même destrier avec son maximum de points de vie.<br>Tant que votre destrier se trouve à 1,5 kilomètre ou moins de vous, vous pouvez communiquer entre vous par télépathie.<br>Vous ne pouvez avoir plus d'un destrier lié grâce à ce sort en même temps. Par une action, vous pouvez libérer votre destrier du lien qui vous unit, et ce à n'importe quel moment. Le destrier disparaît alors.<br>"
	},
	{
		name: "Appel de destrier supérieur",
		originalName: "Find Greater Steed Trouver une monture supérieure",
		castedBy: [
			"paladin"
		],
		id: "d17a6cd4-0b2c-4262-b0bc-b41ac92a96dd",
		level: 4,
		school: "conjuration",
		isRitual: false,
		castingTime: "10 minutes",
		range: "9 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous invoquez un esprit qui se matérialise sous la forme d'un destrier loyal et majestueux. Apparaissant dans un espace inoccupé à portée, l'esprit prend une forme que vous choisissez : un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=griffon\">griffon</a>, un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=pegase\">pégase</a>, un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=peryton\">péryton</a>, un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=loup-sanguinaire\">loup sanguinaire</a>, un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=rhinoceros\">rhinocéros</a> ou un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=tigre-a-dents-de-sabre\">tigre à dents de sabre</a>. La créature a les statistiques du <em>Manuel des Monstres</em> pour la forme choisie, mais est du type céleste, fée ou fiélon (au choix) au lieu de son type normal. De plus, s'il a une Intelligence de 5 ou moins, son Intelligence passe à 6 et il gagne la capacité de comprendre l'une des langues que vous parlez (au choix).<br>Vous contrôlez la monture en combat. Tant que la monture est à moins de 1,5 km de vous, vous pouvez communiquer avec elle par télépathie. Lorsque vous montez votre destrier et que vous lancez un sort qui vous cible, vous pouvez faire en sorte qu'il cible également votre destrier.<br>La monture disparaît temporairement lorsqu'elle tombe à 0 point de vie ou lorsque vous la rejetez par une action. Lancer à nouveau ce sort invoque de nouveau la monture liée, avec tous ses points de vie restaurés et toutes les conditions supprimées. Vous ne pouvez avoir plus d'une monture liée par ce sort ou <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=appel-de-destrier\">appel de destrier</a></em> en même temps. Par une action, vous pouvez libérer une monture de son lien, la faisant disparaître définitivement. Chaque fois que la monture disparaît, elle laisse derrière elle les objets qu'elle portait ou transportait.<br>"
	},
	{
		name: "Arme sacrée",
		originalName: "Holy Weapon",
		castedBy: [
			"paladin"
		],
		id: "78f8dc62-5e26-4275-9992-aea821a28c58",
		level: 5,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "contact",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "L'arme cible brille, inflige 2d8 dégâts radiants supplémentaires et peut exploser sur un rayon de 9 m (JdS ou 4d8 radiants)."
	},
	{
		name: "Aura de pureté",
		originalName: "Aura of Purity",
		castedBy: [
			"paladin"
		],
		id: "4641ee25-ff16-4ac2-bddc-20255aac0127",
		level: 4,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (rayon de 9 mètres)",
		components: "V",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Une énergie purificatrice irradie de vous en une aura de 9 mètres de rayon. Jusqu'à la fin du sort, l'aura, centrée sur vous, se déplace en même temps que vous. Toute créature qui n'est pas hostile et est présente dans l'aura (vous y compris) ne peut pas tomber malade, a la résistance aux dégâts de poison, et a un avantage à ses jets de sauvegarde contre les effets provoquant les conditions suivantes&nbsp;: aveuglé, charmé, assourdi, effrayé, paralysé, empoisonné et étourdi.<br>"
	},
	{
		name: "Aura de vie",
		originalName: "Aura of Life",
		castedBy: [
			"paladin"
		],
		id: "05499f7d-85e9-4440-93dc-8a6ba8a9ebec",
		level: 4,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (rayon de 9 mètres)",
		components: "V",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Une énergie protégeant tout ce qui vit irradie de vous en une aura de 9 mètres de rayon. Jusqu'à la fin du sort, l'aura, centrée sur vous, se déplace en même temps que vous. Toute créature qui n'est pas hostile et est présente dans l'aura (vous y compris) a la résistance aux dégâts nécrotiques, et son maximum de points de vie ne peut pas être réduit. De plus, une créature vivante, non hostile, étant à 0 point de vie, regagne 1 point de vie lorsqu'elle débute son tour au sein de l'aura.<br>"
	},
	{
		name: "Aura de vitalité",
		originalName: "Aura of Vitality",
		castedBy: [
			"paladin"
		],
		id: "df9b88e1-9312-4a64-9b32-a3a0c9f9efed",
		level: 3,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (rayon de 9 mètres)",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "Une énergie régénératrice irradie de vous en une aura de 9 mètres de rayon. Jusqu'à la fin du sort, l'aura, centrée sur vous, se déplace en même temps que vous. Vous pouvez utiliser une action bonus pour qu'une créature présente dans l'aura (vous y compris) récupère 2d6 points de vie.<br>"
	},
	{
		name: "Aura du croisé",
		originalName: "Crusader's Mantle",
		castedBy: [
			"paladin"
		],
		id: "689e23c7-0b0f-49f4-886c-e1ab612705ce",
		level: 3,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "Un pouvoir sacré irradie de vous sous la forme d'une aura de 9 mètres de rayon, réveillant la hardiesse des créatures amicales. Jusqu'à la fin du sort, l'aura se déplace en même temps que vous, centrée sur vous. Toute créature dans l'aura qui ne vous est pas hostile (y compris vous-même) inflige 1d4 dégâts radiants supplémentaires lorsqu'elle touche avec une attaque avec une arme.<br>"
	},
	{
		name: "Cercle de pouvoir",
		originalName: "Circle of Power",
		castedBy: [
			"paladin"
		],
		id: "1b9062ef-bfbf-4fea-b054-b92387d738ac",
		level: 5,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (rayon de 9 mètres)",
		components: "V",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous irradiez de l'énergie divine, distordant et diffusant de l'énergie magique à 9 mètres autour de vous. Jusqu'à la fin du sort, la sphère se déplace en même temps que vous de sorte que vous en restez l'épicentre. Pour la durée du sort, toute créature amicale dans la zone (vous y compris) a un avantage à ses jets de sauvegarde effectués contre des sorts et tout autre effet magique. De plus, lorsque les créatures affectées réussissent un jet de sauvegarde effectué contre un sort ou un effet magique qui leur permet de réduire de moitié les dégâts subis en cas de réussite au jet de sauvegarde, elles ne prennent aucun dégât de la part de ce sort ou effet magique.<br>"
	},
	{
		name: "Cérémonie",
		originalName: "Ceremony",
		castedBy: [
			"paladin"
		],
		id: "acf708d3-0777-4f96-ac73-b104c16e004f",
		level: 1,
		school: "abjuration",
		isRitual: true,
		castingTime: "1 heure",
		range: "contact",
		components: "V, S, M (25 po de poudre d'argent, que le sort consomme)",
		duration: "instantanée",
		description: "Vous réalisez une cérémonie religieuse qui est imprégnée de magie. Lorsque vous lancez ce sort, choisissez l'un des rites suivants, la cible devant se trouver à 3 mètres ou moins de vous durant tout le temps d'incantation.<br><strong>Expiation</strong>. Vous touchez une créature consentante dont l'alignement a changé et faites un jet de Sagesse (Intuition) DD 20. En cas de réussite, vous restaurez l'alignement original de la cible.<br><strong>Eau bénite</strong>. Vous touchez une fiole d'eau et celle-ci devient de l'eau bénite.<br><strong>Passage à l'âge adulte</strong>. Vous touchez un humanoïde suffisamment âgé pour être un jeune adulte. Pendant les prochaines 24 heures, lorsque la cible effectue un jet de caractéristique, elle peut lancer un d4 et ajouter le résultat au jet de caractéristique. Une créature ne peut bénéficier de ce rite qu'une seule fois.<br><strong>Dévouement</strong>. Vous touchez un humanoïde qui souhaite se mettre au service de votre dieu. Pendant les prochaines 24 heures, lorsque la cible effectue un jet de sauvegarde, elle peut lancer un d4 et ajouter le résultat au jet de sauvegarde. Une créature ne peut bénéficier de ce rite qu'une seule fois.<br><strong>Rite funéraire</strong>. Vous touchez un cadavre et pendant les 7 prochains jours, la cible ne peut pas devenir un mort-vivant par aucun autre moyen que le sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=souhait\">souhait</a></em>.<br><strong>Mariage</strong>. Vous touchez des humanoïdes adultes prêts à s'unir par les liens du mariage. Pour les 7 prochains jours, chaque cible gagne un bonus de +2 à la CA tant qu'ils sont à 9 mètres ou moins l'un de l'autre. Une créature ne peut bénéficier de nouveau de ce rite que si elle est veuve.<br>"
	},
	{
		name: "Châtiment aveuglant",
		originalName: "Blinding Smite",
		castedBy: [
			"paladin"
		],
		id: "719c8d78-a4cd-4679-a972-fe2b762891d3",
		level: 3,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "La prochaine fois que vous touchez une créature avec une attaque au corps à corps avec une arme durant la durée du sort, votre arme rayonne d'une vive lumière, et l'attaque inflige à la cible 3d8 dégâts radiants supplémentaires. De plus, la cible doit réussir un jet de sauvegarde de Constitution sous peine d'être aveuglée jusqu'à la fin du sort.<br>Une créature aveuglée par ce sort effectue un nouveau jet de sauvegarde de Constitution à la fin de chacun de ses tours. Sur un jet de sauvegarde réussi, elle n'est plus aveuglée.<br>"
	},
	{
		name: "Châtiment calcinant",
		originalName: "Searing Smite",
		castedBy: [
			"paladin"
		],
		id: "7b8987cd-df27-4de4-b172-93949eb57fa4",
		level: 1,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "La prochaine fois que vous touchez une créature avec une attaque au corps à corps avec une arme pendant la durée du sort, votre arme est chauffée à blanc, et votre attaque inflige 1d6 dégâts de feu supplémentaires à la cible et l'enflamme. Au début de chacun de ses tours jusqu'à la fin du sort, la cible doit effectuer un jet de sauvegarde de Constitution. En cas d'échec, elle subit 1d6 dégâts de feu. En cas de réussite, le sort prend fin. Si la cible, ou une créature située à 1,50 mètre d'elle, utilise son action pour étouffer les flammes, ou si tout autre effet éteint les flammes (par exemple si la cible se plonge dans l'eau), le sort prend fin.",
		higherLevel: "Si vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts supplémentaires initiaux infligés par l'attaque augmentent de 1d6 pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Châtiment courroucé",
		originalName: "Wrathful Smite",
		castedBy: [
			"paladin"
		],
		id: "ea8f9400-7d29-44c0-9c76-cfdd9be2b475",
		level: 1,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "La prochaine fois que vous touchez une cible lors d'une attaque au corps à corps avec une arme pendant la durée du sort, votre attaque inflige 1d6 dégâts psychiques supplémentaires. De plus, si la cible est une créature, elle doit réussir un jet de sauvegarde de Sagesse ou être effrayée jusqu'à la fin du sort. Par une action, la créature peut effectuer un jet de Sagesse contre le DD de sauvegarde de votre sort pour mettre un terme à cet effet et au sort.<br>"
	},
	{
		name: "Châtiment débilitant",
		originalName: "Staggering Smite",
		castedBy: [
			"paladin"
		],
		id: "476e4ca4-67eb-4f5c-9d7d-a203a6c359b3",
		level: 4,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "La prochaine fois que vous touchez une créature lors d'une attaque au corps à corps avec une arme pendant la durée du sort, votre arme frappe à la fois le corps et l'esprit de la cible, et lui inflige 4d6 dégâts psychiques supplémentaires. La cible doit effectuer un jet de sauvegarde de Sagesse. En cas d'échec, elle a un désavantage à ses jets d'attaque et à ses jets de caractéristique, et ne peut utiliser de réaction, jusqu'à la fin de son prochain tour.<br>"
	},
	{
		name: "Châtiment du ban",
		originalName: "Banishing Smite",
		castedBy: [
			"paladin"
		],
		id: "6c69627b-1a35-4ef4-b8d7-9699e0a8027c",
		level: 5,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "La prochaine fois que vous touchez une créature avec une attaque avec une arme avant que ce sort ne prenne fin, votre arme crépite avec force, votre attaque infligeant 5d10 dégâts de force supplémentaires à la cible. De plus, si cette attaque réduit la cible à 50 points de vie ou moins, vous la bannissez. Si la cible est native d'un autre plan d'existence que celui sur lequel vous vous trouvez, la cible disparaît, retournant sur son plan d'origine. Si la cible est native du plan d'existence sur lequel vous êtes, la créature est envoyée sur un demi-plan non-dangereux. Tant qu'elle s'y trouve, la cible est incapable d'agir. Elle y reste jusqu'à ce que le sort prenne fin, puis la cible réapparaît à l'endroit qu'elle avait quitté ou à l'espace inoccupé le plus proche si cet espace est déjà occupé.<br>"
	},
	{
		name: "Châtiment révélateur",
		originalName: "Branding Smite",
		castedBy: [
			"paladin"
		],
		id: "2379f2de-2e54-4c0f-bc7c-2448dd232729",
		level: 2,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "La prochaine fois que vous touchez une créature lors d'une attaque avec une arme avant que le sort ne prenne fin, votre arme rayonne d'une lueur astrale au moment de l'impact. L'attaque inflige 2d6 dégâts radiants supplémentaires à la cible, qui devient visible si elle était invisible, et la cible émet une lumière faible dans un rayon de 1,50 mètre et ne peut devenir invisible tant que le sort persiste.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, les dégâts supplémentaires augmentent de 1d6 pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Châtiment tonitruant",
		originalName: "Thunderous Smite",
		castedBy: [
			"paladin"
		],
		id: "442531f4-7666-4c20-b809-707e128743bc",
		level: 1,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "La première fois que vous touchez une cible lors une attaque au corps à corps avec une arme pendant que le sort est actif, votre arme résonne tel un tonnerre audible à 90 mètres à la ronde, et l'attaque inflige 2d6 dégâts de tonnerre supplémentaires à la cible. De plus, si la cible est une créature, elle doit réussir un jet de sauvegarde de Force sous peine d'être repoussée de vous sur 3 mètres puis de tomber à terre.<br>"
	},
	{
		name: "Convocation de céleste",
		originalName: "Summon Celestial",
		castedBy: [
			"paladin"
		],
		id: "0c53b59f-671a-46b4-a152-f786a6e13d21",
		level: 5,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (un reliquaire en or d'une valeur d'au moins 500 po)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Invoque 1 esprit de céleste (vengeur ou défenseur) amical (bloc stat/votre niv)."
	},
	{
		name: "Duel forcé",
		originalName: "Compelled Duel",
		castedBy: [
			"paladin"
		],
		id: "50947fcb-c7ce-4df5-8978-835ea5edf9ca",
		level: 1,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "9 mètres",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous essayez de contraindre une créature à engager un duel avec vous. Une créature à portée que vous pouvez voir doit effectuer un jet de sauvegarde de Sagesse. En cas d'échec, vous obnubilez la créature, contrainte par votre exigence divine. Pour toute la durée du sort, la créature a un désavantage à ses jets d'attaque effectués contre d'autres créatures que vous, et doit effectuer un jet de sauvegarde de Sagesse à chaque fois qu'elle essaye de s'éloigner à plus de 9 mètres de vous ; si elle réussit son jet de sauvegarde, le sort ne restreint pas son mouvement pour ce tour. <br>Ce sort se termine si vous attaquez une autre créature, si vous lancez un sort qui cible une autre créature hostile que la cible, si une créature qui vous est alliée inflige des dégâts à la cible ou lance un sort sur la cible qui lui est nuisible, ou si vous terminez votre tour à plus de 9 mètres de la cible.<br>"
	},
	{
		name: "Faveur divine",
		originalName: "Divine Favor",
		castedBy: [
			"paladin"
		],
		id: "e6d9b6ee-a767-4db0-9fd4-54564758c4fd",
		level: 1,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Votre prière vous donne de la puissance dans un rayonnement divin. Jusqu'à ce que le sort se termine, vos attaques avec une arme infligent 1d4 dégâts radiants supplémentaires lorsqu'elles touchent.<br>"
	},
	{
		name: "Vague destructrice",
		originalName: "Destructive Wave",
		castedBy: [
			"paladin"
		],
		id: "cd448a78-e319-4a16-96a4-ac123a0d2f6e",
		level: 5,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (rayon de 9 mètres)",
		components: "V",
		duration: "instantanée",
		description: "Vous frappez le sol, créant une onde d'énergie divine qui se propage à partir de vous. Chaque créature que vous choisissez, située à 9 mètres ou moins de vous, doit effectuer un jet de sauvegarde de Constitution. En cas d'échec, elle subit 5d6 dégâts de tonnerre ainsi que 5d6 dégâts radiants ou nécrotiques (au choix) et tombe à terre. En cas de réussite elle ne subit que la moitié de ces dégâts et ne tombe pas à terre.<br>"
	},
	{
		name: "Voile spirituel",
		originalName: "Spirit Shroud",
		castedBy: [
			"paladin",
			"warlock",
			"wizard"
		],
		id: "556682a6-1947-49cc-981c-ad69d4e2bc32",
		level: 3,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Si l'attaque touche, inflige 1d8 dégâts radiants, nécrotiques ou de froid extra. La cible ne regagne de pv ce tour (dégâts/niv)."
	},
	{
		name: "Carquois magique",
		originalName: "Swift Quiver Vif carquois",
		castedBy: [
			"ranger"
		],
		id: "7b4de738-df56-48f2-b4b6-4e42fccd5b64",
		level: 5,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "contact",
		components: "V, S, M (un carquois contenant au moins une munition)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous transmutez votre carquois pour qu'il produise constamment des munitions non magiques qui semblent voler jusqu'à votre main lorsque vous en avez besoin.<br>À chacun de vos tours avant que le sort ne prenne fin, vous pouvez utiliser votre action bonus pour effectuer deux attaques avec une arme qui utilise les munitions de ce carquois. Chaque fois que vous effectuez une attaque à distance, votre carquois remplace magiquement la munition que vous venez d'utiliser par une nouvelle munition similaire non magique. Chaque munition créée par ce sort est détruite lorsque le sort prend fin. Si le carquois n'est plus en votre possession, le sort prend fin.<br>"
	},
	{
		name: "Cordon de flèches",
		originalName: "Cordon of Arrows",
		castedBy: [
			"ranger"
		],
		id: "4196f698-c0a6-4971-b711-3c37c57a6643",
		level: 2,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "1,50 mètre",
		components: "V, S, M (quatre ou plus flèches ou carreaux)",
		duration: "8 heures",
		description: "Vous plantez quatre pièces de munition non magiques (flèches ou carreaux d'arbalète) dans le sol à portée et y apposez votre magie pour qu'elles protègent la zone. Jusqu'à la fin du sort, à chaque fois qu'une autre créature que vous arrive à 9 mètres ou moins des munitions, pour la première fois du tour, ou termine son tour dans ces 9 mètres, une pièce de munition s'envole pour la frapper. La créature doit réussir un jet de sauvegarde de Dextérité ou subir 1d6 dégâts perforants. La pièce de munition est ensuite détruite. La sort se termine lorsqu'il ne reste plus de munition.<br>Lorsque vous lancez ce sort, vous pouvez désigner toutes les créatures que vous souhaitez pour que le sort les ignore.",
		higherLevel: "Si vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, le nombre de munitions qui peuvent être affectées augmente de deux pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Flèche de foudre",
		originalName: "Lightning Arrow",
		castedBy: [
			"ranger"
		],
		id: "10dacd9f-93f2-4222-99a0-b683c50fddb3",
		level: 3,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "La prochaine fois que vous effectuez une attaque à distance avec une arme pendant la durée de ce sort, la munition, ou l'arme elle même si c'est une arme de lancer, se transforme en un éclair de foudre. Effectuez le jet d'attaque normalement. La cible subit, au lieu des dégâts normaux de l'arme, 4d8 dégâts de foudre si le coup touche, ou la moitié de ces dégâts en cas d'échec.<br>Que vous touchiez ou non, chaque créature se trouvant dans un rayon de 3 mètres autour de la cible doit effectuer un jet de sauvegarde de Dextérité. Chacune de ces créatures subit 2d8 dégâts de foudre en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br>La munition, ou l'arme, retrouve ensuite sa forme habituelle.",
		higherLevel: "Si vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, les dégâts de chaque effet du sort augmentent de 1d8 pour chaque niveau d'emplacement au-delà du niveau 3.<br>"
	},
	{
		name: "Frappe du vent d'acier",
		originalName: "Steel Wind Strike",
		castedBy: [
			"ranger",
			"wizard"
		],
		id: "d3950958-7948-47f7-8820-7ae1ec31c6a9",
		level: 5,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "S, M (une arme de corps à corps d'une valeur d'au moins 1 pa)",
		duration: "instantanée",
		description: "Si l'attaque avec un sort touche, inflige 6d10 dégâts de force à 5 créatures, puis le lanceur se téléporte."
	},
	{
		name: "Frappe du zéphyr",
		originalName: "Zephyr Strike",
		castedBy: [
			"ranger"
		],
		id: "d97b77a5-abb6-45b4-9946-92af3dc04fa3",
		level: 1,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous vous déplacez comme le vent. Tant que le sort n'est pas terminé, votre mouvement ne provoque pas d'attaques d'opportunité.<br>Une fois avant que le sort ne se termine, vous pouvez vous donner un avantage à un jet d'attaque avec une arme à votre tour. Cette attaque inflige 1d8 dégâts de force supplémentaires si elle touche. Que vous touchiez ou non, votre vitesse augmente de 9 mètres jusqu'à la fin de ce tour.<br>"
	},
	{
		name: "Frappe piégeante",
		originalName: "Ensnaring Strike Frappe piégeuse",
		castedBy: [
			"ranger"
		],
		id: "5f3d041c-d29f-47b4-b0f0-3186e86f0b8b",
		level: 1,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "La prochaine fois que vous touchez une créature avec une attaque avec une arme avant que ce sort ne prenne fin, une masse tortueuse de lianes épineuses apparaît au point d'impact, et la cible doit réussir un jet de sauvegarde de Force sous peine d'être entravée par ces lianes magiques jusqu'à ce que le sort prenne fin. Une créature de taille G ou supérieure a un avantage à son jet de sauvegarde. Si la cible réussit son jet de sauvegarde, les lianes se flétrissent et tombent.<br>Tant qu'elle est entravée par ce sort, la cible subit 1d6 dégâts perforants au début de chacun de ses tours. Une créature entravée par ces lianes, ou une autre créature capable de la toucher, peut utiliser son action pour effectuer un jet de Force contre le DD de sauvegarde de votre sort. En cas de réussite, la cible est libérée.",
		higherLevel: "Si vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts augmentent de 1d6 pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Grêle d'épines",
		originalName: "Hail of Thorns",
		castedBy: [
			"ranger"
		],
		id: "52530f56-b49e-4926-82ad-22ae7039d789",
		level: 1,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "La prochaine fois que vous touchez une créature lors d'une attaque à distance avec une arme avant que le sort ne prenne fin, ce sort crée une pluie d'épines qui jaillissent de votre arme à distance ou de la munition. En plus de l'effet normal de l'attaque, la cible de l'attaque et toutes les créatures à 1,50 mètre ou moins d'elle doivent effectuer un jet de sauvegarde de Dextérité, subissant 1d10 dégâts perforants en cas d'échec, ou la moitié de ces dégâts en cas de réussite.",
		higherLevel: "Si vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts augmentent de 1d10 pour chaque niveau d'emplacement au-delà du niveau 1 (jusqu'à un maximum de 6d10).<br>"
	},
	{
		name: "Invocation de projectiles",
		originalName: "Conjure Barrage Hérissement de projectiles",
		castedBy: [
			"ranger"
		],
		id: "d03eddbd-28ff-4f18-bb40-3bdc9be79ea0",
		level: 3,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (cône de 18 mètres)",
		components: "V, S, M (une pièce de munition ou une arme de lancer)",
		duration: "instantanée",
		description: "Vous lancez une arme non magique ou tirez une munition non magique en l'air pour créer un cône d'armes identiques propulsées vers l'avant, qui disparaissent une fois l'autre course terminée. Chaque créature dans un cône de 18 mètres doit effectuer un jet de sauvegarde de Dextérité, subissant 3d8 dégâts en cas d'échec, ou la moitié de ces dégâts en cas de réussite. Le type de dégâts est le même que celui de l'arme ou de la munition utilisée comme composante.<br>"
	},
	{
		name: "Invocation de volée",
		originalName: "Conjure Volley",
		castedBy: [
			"ranger"
		],
		id: "1a8d25d8-f7b6-4974-b6f9-3139f975955e",
		level: 5,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "45 mètres",
		components: "V, S, M (une pièce de munition ou une arme de lancer)",
		duration: "instantanée",
		description: "Vous tirez une munition non magique avec une arme à distance ou lancez une arme non magique dans les airs et choisissez un point à portée. Des centaines de reproductions de cette munition ou de cette arme tombent en une véritable pluie de projectiles puis disparaissent. Chaque créature, présente dans un cylindre haut de 6 mètres et d'un rayon de 12 mètres centré au point que vous avez choisi, doit effectuer un jet de sauvegarde de Dextérité. Une créature subit 8d8 dégâts en cas d'échec, ou la moitié de ces dégâts en cas de réussite. Le type de dégâts infligés est le même que celui de la munition ou de l'arme.<br>"
	},
	{
		name: "Marque du chasseur",
		originalName: "Hunter's Mark",
		castedBy: [
			"ranger"
		],
		id: "638120f2-85c5-44fb-8ff3-5142d86bd1cf",
		level: 1,
		school: "divination",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "27 mètres",
		components: "V",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous choisissez une créature que vous pouvez voir et à portée, et la marquez magiquement comme étant votre cible. Jusqu'à ce que le sort prenne fin, vous infligez 1d6 dégâts supplémentaires à la cible lorsque vous la touchez lors d'une attaque avec une arme, et vous avez un avantage à tous vos jets de Sagesse (Perception) ou Sagesse (Survie) effectués pour la trouver. Si la cible tombe à 0 point de vie avant que le sort ne prenne fin, vous pouvez utiliser votre action bonus lors de l'un de vos tours suivants pour marquer une nouvelle créature.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou 4, vous pouvez maintenir votre concentration sur ce sort pendant 8 heures maximum. Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 5 ou supérieur, vous pouvez maintenir votre concentration sur ce sort pendant 24 heures maximum.<br>"
	},
	{
		name: "Apparence d'Outremonde de Tasha",
		originalName: "Tasha's Otherworldly Guise",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "4ef2e6f3-f64a-42c4-875c-16d81a468935",
		level: 6,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V, S, M (un objet gravé d'un symbole des plans extérieurs, d'une valeur d'au moins 500 po)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Immunisé aux dégâts de feu/poison ou radiants/nécrotiques, vitesse de vol de 12 m, +2 à la CA, armes magiques, 2 attaques."
	},
	{
		name: "Armure de mage",
		originalName: "Mage Armor Armure du mage",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "ae96693d-2cb3-4c16-9809-0814a5989733",
		level: 1,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (un morceau de cuir tanné)",
		duration: "8 heures",
		description: "Vous touchez une créature consentante qui ne porte pas d'armure, et une force magique de protection l'englobe jusqu'à ce que le sort prenne fin. La CA de la cible passe à 13 + son modificateur de Dextérité. Le sort prend fin si la cible enfile une armure ou si vous prenez une action pour interrompre le sort.<br>"
	},
	{
		name: "Arrêt du temps",
		originalName: "Time Stop",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "62acfccf-8a8f-4bbb-aef8-e4ab81be46c6",
		level: 9,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V",
		duration: "instantanée",
		description: "Vous arrêtez brièvement l'écoulement du temps pour tout le monde, sauf pour vous-même. Le temps ne s'écoule pas pour les autres créatures, tandis que vous profitez de 1d4 + 1 tours au cours desquels vous pouvez utiliser à votre guise les actions et mouvements qui vous sont dus normalement.<br>Ce sort prend fin si l'une des actions que vous utilisez lors de cette période, ou l'un des effets que vous créez au cours de cette période, affecte une créature autre que vous ou un objet étant porté par quelqu'un d'autre que vous. De plus, le sort prend fin si vous vous déplacez à plus de 300 mètres d'où vous l'avez lancé.<br>"
	},
	{
		name: "Bouclier",
		originalName: "Shield",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "b09cb288-0948-4f9a-a51b-3a58c1252ae4",
		level: 1,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 réaction, que vous prenez lorsque vous êtes touché par une attaque ou ciblé par le sort projectile magique",
		range: "personnelle",
		components: "V, S",
		duration: "1 round",
		description: "Une barrière invisible de force magique apparaît et vous protège. Jusqu'au début de votre prochain tour, vous obtenez un bonus de +5 à votre CA, y compris contre l'attaque qui a déclenché le sort, et vous ne prenez aucun dégât par le sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=projectile-magique\">projectile magique</a></em>.<br>"
	},
	{
		name: "Boule de feu",
		originalName: "Fireball",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "fbdd87c6-ba27-44b4-a482-47ab9548d1bb",
		level: 3,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "45 mètres",
		components: "V, S, M (une toute petite boule de guano de chauve-souris et du souffre)",
		duration: "instantanée",
		description: "Une éclatante traînée lumineuse est émise de la pointe de votre doigt vers un point de votre choix dans la portée du sort, puis s'amplifie dans un rugissement grave jusqu'à éclater en flammes. Chaque créature située dans une sphère de 6 mètres de rayon centrée sur le point doit effectuer un jet de sauvegarde de Dextérité, subissant 8d6 dégâts de feu en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br>Le feu contourne les coins. Il enflamme les objets inflammables qui ne sont pas portés ou transportés.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, les dégâts sont augmentés de 1d6 pour chaque niveau d'emplacement au-delà du niveau 3.<br>"
	},
	{
		name: "Boule de feu à retardement",
		originalName: "Delayed Blast Fireball",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "f6fcdcdb-f586-42c7-80af-0895bd8050b2",
		level: 7,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "45 mètres",
		components: "V, S, M (une toute petite boule de guano de chauve-souris et du souffre)",
		duration: "concentration, jusqu'à 1 minute",
		description: "La pointe de votre doigt émet un rayon de lumière jaune qui se concentre sur un point dans la portée du sort et prend la forme d'une bille luisante pour la durée du sort. Lorsque le sort prend fin, soit parce que votre concentration est interrompue, soit parce que vous décidez d'y mettre fin, la bille s'ouvre dans un rugissement grave et laisse éclater des flammes qui contournent les coins. Chaque créature dans une sphère de 6 mètres de rayon centrée sur ce point doit effectuer un jet de sauvegarde de Dextérité, subissant un nombre de dégâts de feu égal à la somme cumulée en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br>Les dégâts de base sont 12d6. Si à la fin de votre tour la bille n'a pas encore explosé, les dégâts augmentent de 1d6.<br>Si la bille luisante est touchée avant la fin du sort, la créature qui la touche doit effectuer un jet de sauvegarde de Dextérité. En cas d'échec, le sort prend fin, déclenchant l'éruption de la bille en flammes. En cas de réussite, la créature peut lancer la bille jusqu'à 12 mètres. Lorsqu'elle atteint une créature ou un objet solide, le sort prend fin et la bille explose.<br>Le feu endommage les objets dans la zone et enflamme les objets inflammables qui ne sont pas portés ou transportés.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 8 ou supérieur, les dégâts de base augmentent de 1d6 pour chaque niveau d'emplacement au-delà du niveau 7.<br>"
	},
	{
		name: "Cercle de mort",
		originalName: "Circle of Death",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "47cce946-0f7b-455e-8b86-d1a7b71f5024",
		level: 6,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "45 mètres",
		components: "V, S, M (de la poudre provenant d'une perle noire broyée, d'une valeur d'au moins 500 po)",
		duration: "instantanée",
		description: "Une sphère d'énergie négative s'étend dans un rayon de 18 mètres à partir d'un point à portée. Chaque créature présente dans la zone doit effectuer un jet de sauvegarde de Constitution, subissant 8d6 dégâts nécrotiques en cas d'échec, ou la moitié de ces dégâts en cas de réussite.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 7 ou supérieur, les dégâts augmentent de 2d6 pour chaque niveau d'emplacement au-delà du niveau 6.<br>"
	},
	{
		name: "Chaîne d'éclairs",
		originalName: "Chain Lightning",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "4c9ae188-a702-43f1-8ef3-8d5468247b81",
		level: 6,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "45 mètres",
		components: "V, S, M (quelques poils ; un morceau d'ambre, de verre ou un bâtonnet de cristal ; et 3 épingles en argent)",
		duration: "instantanée",
		description: "Vous créez un trait électrifié qui s'arque à partir d'une cible de votre choix que vous pouvez voir et à portée. Trois traits s'élancent de la cible pour se diriger vers trois autres cibles. Chacune d'entre elles doit être à 9 mètres ou moins de la première cible. La cible peut être une créature ou un objet et ne peut être ciblée que par un seul des traits.<br>Toute cible doit effectuer un jet de sauvegarde de Dextérité, subissant 10d8 dégâts de foudre en cas d'échec, ou la moitié de ces dégâts en cas de réussite.",
		higherLevel: "Lorsque vous lancez ce sort avec un emplacement de sort de niveau 7 ou supérieur, un trait additionnel s'élance de la première cible vers une autre cible pour chaque niveau d'emplacement au-delà du niveau 6.<br>"
	},
	{
		name: "Cône de froid",
		originalName: "Cone of Cold",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "e83921d4-930d-45bd-92f8-6c065828ae0e",
		level: 5,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (cône de 18 mètres)",
		components: "V, S, M (un petit cône de cristal ou de verre)",
		duration: "instantanée",
		description: "Un souffle d'air froid est propulsé de vos mains. Chaque créature se trouvant dans les 18 mètres du cône doit effectuer un jet de sauvegarde de Constitution. Une créature subit 8d8 dégâts de froid en cas d'échec, ou la moitié de ces dégâts en cas de réussite. Une créature tuée par le sort devient une statue de glace jusqu'à son dégel.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 6 ou supérieur, les dégâts augmentent de 1d8 pour chaque niveau d'emplacement au-delà du niveau 5.<br>"
	},
	{
		name: "Contact glacial",
		originalName: "Chill Touch",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "0d009e79-eac6-4387-b299-71e5036a075f",
		level: 0,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "1 round",
		description: "Vous créez une main squelettique fantomatique dans l'espace d'une créature à portée. Faites une attaque à distance avec un sort contre la créature pour l'étreindre d'une froideur sépulcrale. Si le coup touche, la cible subit 1d8 dégâts nécrotiques, et elle ne peut récupérer ses points de vie avant le début de votre prochain tour. Jusque-là, la main fantomatique s'accroche à la cible. Si vous ciblez un mort-vivant, il aura également un désavantage à ses jets d'attaque contre vous jusqu'à la fin de votre prochain tour.<br>Les dégâts de ce sort augmentent de 1d8 lorsque vous atteignez le niveau 5 (2d8), le niveau 11 (3d8) et le niveau 17 (4d8).<br>"
	},
	{
		name: "Contresort",
		originalName: "Counterspell",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "9f3208f4-adf0-41a4-b121-09d48e1c8d32",
		level: 3,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 réaction, que vous prenez lorsque vous voyez une créature à 18 mètres ou moins qui incante un sort.",
		range: "18 mètres",
		components: "S",
		duration: "instantanée",
		description: "Vous tentez d'interrompre une créature au moment où elle incante un sort. Si la créature incante un sort de niveau 3 ou inférieur, son sort échoue et il n'a aucun effet. Si elle incante un sort de niveau 4 ou supérieur, effectuez un jet de caractéristique selon celle qui sert à lancer vos sorts. Le DD est de 10 + le niveau du sort. En cas de réussite, le sort de la créature échoue et il n'a aucun effet.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, le sort interrompu n'a aucun effet si son niveau est inférieur ou égal à celui du niveau de l'emplacement de sort utilisé.<br>"
	},
	{
		name: "Couleurs dansantes",
		originalName: "Color Spray",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "3630dda3-a518-4379-aabc-389c12a24573",
		level: 1,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (cône de 4,50 mètres)",
		components: "V, S, M (une pincée de poudre ou de sable de couleur rouge, jaune et bleu)",
		duration: "1 round",
		description: "Un assortiment éblouissant de faisceaux lumineux et colorés fait éruption de votre main. Lancez 6d10. Cette valeur représente le nombre maximal de points de vie des créatures que vous pouvez affecter avec ce sort. Les créatures dans un cône de 4,50 mètres dont vous êtes l'origine sont affectées selon l'ordre croissant de leurs points de vie (en ignorant les créatures inconscientes et celles qui ne peuvent pas voir).<br>En partant de la créature avec le plus petit nombre de points de vie, chaque créature affectée par ce sort est aveuglée jusqu'à la fin de votre prochain tour. Retirez les points de vie de chaque créature avant de passer à la prochaine créature avec le plus petit nombre de points de vie. Les points de vie d'une créature doivent être égaux ou inférieurs au total pour que cette créature soit affectée.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, ajoutez 2d10 au lancer initial pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Couronne d'étoiles",
		originalName: "Crown of Stars",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "81df5082-3f7a-4528-962c-bf471c1c5b5c",
		level: 7,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "1 heure",
		description: "Si l'attaque avec un sort touche, 7 atomes infligent chacun 4d12 dégâts radiants (+1 atome/niv)."
	},
	{
		name: "Désintégration",
		originalName: "Disintegrate",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "32b35404-132c-4d03-8d98-ae1cb740d4c5",
		level: 6,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (de la magnétite et une pincée de poussière)",
		duration: "instantanée",
		description: "Un mince faisceau de lumière verte surgit de la pointe de votre doigt vers une cible visible dans la portée du sort. La cible peut être une créature, un objet ou une création de force magique, comme un mur façonné par <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=mur-de-force\">mur de force</a></em>.<br>Une créature ciblée par ce sort doit réussir un jet de sauvegarde de Dextérité ou subir 10d6 + 40 dégâts de force. La cible est désintégrée si ces dommages la laissent à 0 point de vie.<br>Une créature désintégrée et tout ce qu'elle porte et transporte, à l'exception des objets magiques, sont réduits à l'état de poussière. La créature peut être ramenée à la vie uniquement avec les sorts <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=resurrection-supreme\">résurrection suprême</a></em> et <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=souhait\">souhait</a></em>.<br>Le sort désintègre automatiquement un objet non magique de taille G ou plus petit, ou une création de force magique. Si la cible est un objet ou une création de force de taille TG ou supérieure, le sort désintègre une portion équivalente à un cube de 3 mètres d'arête. Un objet magique n'est pas affecté par ce sort.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 7 ou supérieur, les dégâts sont augmentés de 3d6 pour chaque niveau d'emplacement au-delà du niveau 6.<br>"
	},
	{
		name: "Dispersion",
		originalName: "Scatter",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "ec8a0c60-a2aa-41f5-aa81-58908aa424f1",
		level: 6,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V",
		duration: "instantanée",
		description: "Jusqu'à 5 créatures sont téléportées (JdS de Sag. si non consentantes) dans un rayon de 36 m."
	},
	{
		name: "Doigt de mort",
		originalName: "Finger of Death",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "10d087de-c1f2-4b46-8ac4-184441ab8e12",
		level: 7,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous envoyez de l'énergie négative à travers une créature visible dans la portée du sort, lui causant d'affreuses souffrances. La cible doit effectuer un jet de sauvegarde de Constitution, subissant 7d8 + 30 dégâts nécrotiques en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br>Un humanoïde tué par ce sort se relève au début de votre prochain tour, comme un zombi que vous commandez en permanence et qui suit vos ordres verbaux au mieux de sa capacité.<br>"
	},
	{
		name: "Éclair",
		originalName: "Lightning Bolt",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "b32d59d1-3204-4de6-9eee-1c4d17124ef8",
		level: 3,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (ligne de 30 mètres)",
		components: "V, S, M (un morceau de fourrure et un bâtonnet d'ambre, de cristal ou de verre)",
		duration: "instantanée",
		description: "Un rayon de foudre formant une ligne d'une longueur de 30 mètres et d'une largeur de 1,50 mètre jaillit de vous dans la direction de votre choix. Toute créature sur la ligne doit effectuer un jet de sauvegarde de Dextérité, subissant 8d6 dégâts de foudre en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br>L'éclair enflamme les objets inflammables qui ne sont pas portés ou transportés.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, les dégâts augmentent de 1d6 pour chaque niveau d'emplacement au-delà du niveau 3.<br>"
	},
	{
		name: "Éclair de chaos",
		originalName: "Chaos Bolt",
		castedBy: [
			"sorcerer"
		],
		id: "60411fe1-dbfd-4551-9b51-ab0d7ce84afa",
		level: 1,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous projetez une masse d'énergie chaotique sifflante et ondulante vers une créature à portée. Effectuez un jet d'attaque à distance avec un sort contre la cible. En cas de réussite, la cible prend 2d8 + 1d6 points de dégâts. Choisissez l'un des d8. Le nombre tiré sur ce dé détermine le type de dégâts de l'attaque, comme indiqué ci-dessous.<br><br><table><tbody><tr><th class=\"center\">d8</th><th>Type de dégâts</th></tr><tr><td class=\"center\">1</td><td>Acide</td></tr><tr><td class=\"center\">2</td><td>Froid</td></tr><tr><td class=\"center\">3</td><td>Feu</td></tr><tr><td class=\"center\">4</td><td>Force</td></tr><tr><td class=\"center\">5</td><td>Foudre</td></tr><tr><td class=\"center\">6</td><td>Poison</td></tr><tr><td class=\"center\">7</td><td>Psychique</td></tr><tr><td class=\"center\">8</td><td>Tonnerre</td></tr></tbody></table><br>Si vous avez fait un double avec les d8, l'énergie chaotique rebondit depuis la cible vers une autre créature de votre choix dans un rayon de 9 mètres autour de la première. Effectuez un nouveau jet d'attaque contre cette nouvelle créature et effectuez un jet de dégâts le cas échéant. L'énergie chaotique peut continuer de rebondir, bien qu'une créature ne puisse être affectée qu'une seule fois par chaque sort lancé.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, chaque cible reçoit 1d6 dégâts supplémentaires du type déterminé pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Éclair de sorcière",
		originalName: "Witch Bolt Trait ensorcelé",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "c89f3c1b-de8e-4f72-8dc7-cb44b2bbdebb",
		level: 1,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (la branche d'un arbre qui a été frappé par la foudre)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Un rayon d'énergie bleu crépitante est projeté sur une créature à portée, formant un arc électrique continu entre la cible et vous. Effectuez une attaque à distance avec un sort contre la créature. Si vous touchez, la cible subit 1d12 dégâts de foudre, et à chacun de vos tours, pour la durée du sort, vous pouvez utiliser votre action pour infliger automatiquement 1d12 dégâts de foudre à la cible. Le sort se termine si vous utilisez votre action pour faire autre chose qu'infliger ces dégâts de foudre, si la cible se retrouve hors de la portée du sort, ou si elle obtient un abri total contre vous.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts initiaux sont augmentés de 1d12 pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Énervation",
		originalName: "Enervation",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "ec6c5c63-c526-472b-b6a6-fdce56f503b9",
		level: 5,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "La cible doit réussir un JdS de Dex. ou subir 4d8 dégâts nécrotiques à chaque round (+1d8/niv)."
	},
	{
		name: "Épine mentale",
		originalName: "Mind Spike",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "a79f671b-3433-46e2-ad19-3aefb08e9475",
		level: 2,
		school: "divination",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous atteignez l'esprit d'une créature que vous pouvez voir à portée. La cible doit effectuer un jet de sauvegarde de Sagesse, subissant 3d8 dégâts psychiques en cas d'échec, ou la moitié de ces dégâts en cas de réussite. En cas d'échec à la sauvegarde, vous connaissez toujours l'emplacement de la cible jusqu'à la fin du sort, mais seulement si vous êtes tous les deux sur le même plan d'existence. Tant que vous avez cette connaissance, la cible ne peut pas vous être cachée, et si elle est invisible, elle ne tire aucun avantage de cette condition contre vous.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, les dégâts augmentent de 1d8 [E] pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Esprit désorienté",
		originalName: "Mind Sliver",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "c47ea121-95ae-4377-bf63-12cb1f8f3ad4",
		level: 0,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V",
		duration: "1 round",
		description: "Vous déclenchez une pointe d'énergie psychique désorientante dans l'esprit d'une créature que vous pouvez voir à portée. La cible doit effectuer un jet de sauvegarde d'Intelligence. En cas d'échec, elle subit 1d6 dégâts psychiques et la première fois qu'elle effectuera un jet de sauvegarde avant la fin de votre prochain tour, elle devra lancer un d4 et soustraire le nombre obtenu du résultat de sa sauvegarde.<br>Les dégâts de ce sort augmentent de 1d6 lorsque vous atteignez les niveaux 5 (2d6), 11 (3d6) et 17 (4d6).<br>"
	},
	{
		name: "Flambée d'Aganazzar",
		originalName: "Aganazzar's Scorcher",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "1d116442-f008-48fa-bc59-26441838a454",
		level: 2,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (une écaille de dragon rouge)",
		duration: "instantanée",
		description: "Une ligne de flammes rugissantes de 9 mètres de long et 1,50 mètre de large émane de vous dans une direction que vous choisissez. Chaque créature dans la trajectoire doit effectuer un jet de sauvegarde de Dextérité, subissant 3d8 dégâts de feu en cas d'échec, ou la moitié de ces dégâts en cas de réussite.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, les dégâts augmentent de 1d8 pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Flétrissure épouvantable d'Abi-Dalzim",
		originalName: "Abi-Dalzim's Horrid Wilting Épouvantable flétrissure d'Abi-Dalzim",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "54f9e5cf-b990-4019-bc0d-00a4aec212bb",
		level: 8,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "45 mètres",
		components: "V, S, M (un morceau d'éponge)",
		duration: "instantanée",
		description: "Vous absorbez l'humidité de chaque créature dans un cube de 9 mètres d'arête centré sur un point de votre choix dans la portée du sort. Chaque créature dans cette zone doit faire un jet de sauvegarde de Constitution. Les morts-vivants et les artificiels ne sont pas affectés ; les plantes et les élémentaires d'eau font ce jet de sauvegarde avec un désavantage. Une créature subit 12d8 dégâts nécrotiques en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br>Les plantes non magiques dans la zone qui ne sont pas des créatures, comme les arbres et les arbustes, se flétrissent et meurent instantanément.<br>"
	},
	{
		name: "Forme gazeuse",
		originalName: "Gaseous Form",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "2b527599-ea1b-42ba-a757-02318bc64195",
		level: 3,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (un morceau de gaze et une volute de fumée)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous transformez une créature consentante que vous touchez, ainsi que tout ce qu'elle porte et transporte, en un nuage brumeux pour la durée du sort. Le sort prend fin si la créature atteint 0 point de vie. Une créature immatérielle n'est pas affectée.<br>Alors qu'elle est dans cet état, la cible ne peut se déplacer que par le vol, à la vitesse de 3 mètres. La cible peut pénétrer et occuper l'espace d'une autre créature. La cible possède une résistance aux dégâts non magiques, et elle a un avantage à ses jets de sauvegarde de Force, Dextérité et Constitution. La cible peut passer par de petits trous, des ouvertures étroites et même par des fissures. Cependant, elle considère les liquides comme des surfaces dures. La cible ne peut chuter et elle se maintient dans les airs même lorsqu'elle est étourdie ou autrement indisposée.<br>Alors qu'elle est dans l'état d'un nuage brumeux, la cible ne peut parler ou manipuler des objets. Les objets qu'elle transportait ou tenait ne peuvent être lâchés ou utilisés de quelconque façon. La cible ne peut attaquer ou lancer des sorts.<br>"
	},
	{
		name: "Fouet mental de Tasha",
		originalName: "Tasha's Mind Whip",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "eb645350-4f2c-47df-9582-0bba3ab5e49f",
		level: 2,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V",
		duration: "1 round",
		description: "Vous fouettez psychiquement l'esprit d'une créature que vous pouvez voir à portée du sort. La cible doit effectuer un jet de sauvegarde d'Intelligence. En cas d'échec, elle subit 3d6 dégâts psychiques et elle ne peut utiliser sa réaction avant la fin de son prochain tour. De plus, lors de son prochain tour, elle devra choisir si elle effectue un mouvement, une action ou une action bonus ; elle ne pourra effectuer que l'un des trois. En cas réussite, la cible ne subit que la moitié de ces dégâts et n'est affectée par aucun des autres effets du sort.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de niveau 3 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d'emplacement supérieur au niveau 2. Les créatures doivent être à 9 mètres ou moins les unes des autres lorsque vous les ciblez.<br>"
	},
	{
		name: "Foulée brumeuse",
		originalName: "Misty Step",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "fe9cbe2f-ff07-4694-9c84-e2a8ad8e472e",
		level: 2,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V",
		duration: "instantanée",
		description: "Une brume argentée vous enveloppe puis vous vous téléportez jusqu'à 9 mètres dans un espace inoccupé que vous pouvez voir.<br>"
	},
	{
		name: "Globe d'invulnérabilité",
		originalName: "Globe of Invulnerability",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "a88c8036-08d6-4c10-b5be-9be13f1d13a9",
		level: 6,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (rayon de 3 mètres)",
		components: "V, S, M (une bulle de verre ou de cristal qui éclate au terme du sort)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Une barrière immobile et légèrement chatoyante prend la forme d'une sphère de 3 mètres de rayon autour de vous, et persiste pour la durée du sort.<br>Tout sort de niveau 5 ou moins incanté à l'extérieur de la barrière ne peut affecter les créatures et les objets qu'elle englobe, même si le sort utilise un emplacement de sort supérieur. Un tel sort peut cibler les créatures et les objets à l'intérieur de la barrière, mais ce sort n'a pas d'effet sur eux. De la même manière, la zone à l'intérieur de la sphère est exclue des zones affectées par de tels sorts.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 7 ou supérieur, la barrière bloque les sorts d'un niveau supérieur pour chaque niveau d'emplacement au-delà du niveau 6.<br>"
	},
	{
		name: "Image miroir",
		originalName: "Mirror Image",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "4febefd5-3fda-4a4f-9e58-6514f1ac31e7",
		level: 2,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "1 minute",
		description: "Trois duplicatas illusoires de votre personne apparaissent dans votre espace. Jusqu'à la fin du sort, les duplicatas se déplacent avec vous et ils imitent vos actions, permutant leur position de sorte qu'il soit impossible de déterminer laquelle des images est réelle. Vous pouvez utiliser votre action pour dissiper les duplicatas illusoires.<br>À chaque fois qu'une créature vous prend pour cible avec une attaque pendant la durée du sort, lancez 1d20 pour déterminer si l'attaque ne cible pas plutôt un de vos duplicatas.<br>Si vous avez trois duplicatas, vous devez obtenir 6 ou plus sur votre lancer pour diriger la cible de l'attaque vers un duplicata. Avec deux duplicatas, vous devez obtenir 8 ou plus. Avec un seul duplicata, vous devez obtenir 11 ou plus.<br>La CA d'un duplicata est égale à 10 + votre modificateur de Dextérité. Si une attaque touche un duplicata, il est détruit. Un duplicata peut être détruit seulement par une attaque qui le touche. Il ignore les autres dégâts et effets. Le sort prend fin si les trois duplicatas sont détruits.<br>Une créature n'est pas affectée par ce sort si elle ne peut pas voir, si elle se fie sur un autre sens que la vision, comme la vision aveugle, ou si elle peut percevoir les illusions comme étant fausses, comme avec vision suprême.<br>"
	},
	{
		name: "Immolation",
		originalName: "Immolation",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "037f9b0f-c5ac-4065-8528-da3dfa43f4ca",
		level: 5,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "Les flammes enveloppent une créature visible dans la portée du sort. La cible doit effectuer un jet de sauvegarde de Dextérité, subissant 8d6 dégâts de feu en cas d'échec, ou la moitié de ces dégâts en cas de réussite. En cas d'échec, la cible prend feu pour la durée du sort. La cible en feu répand une lumière vive jusqu'à 9 mètres de rayon et une lumière faible sur 9 mètres supplémentaires. À la fin de chacun de ses tours, la cible refait le jet de sauvegarde. Elle subit 4d6 dégâts de feu en cas d'échec, et le feu s'éteint en cas de réussite. Ces flammes magiques ne peuvent pas être éteintes par des moyens non magiques.<br>Si les dégâts de ce sort tuent une cible, celle-ci est transformée en cendre.<br>"
	},
	{
		name: "Lame d'ombres",
		originalName: "Shadow Blade",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "70b9614a-9477-4fe8-bea3-878d2522b805",
		level: 2,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous tissez ensemble des fils d'ombre pour créer une épée de ténèbres solidifiées dans votre main. Cette épée magique dure jusqu'à la fin du sort. Elle compte comme une arme courante de corps à corps que vous maîtrisez. Elle inflige 2d8 dégâts psychiques si vous touchez et possède les propriétés finesse, légère et lancer (portée 6/18). De plus, lorsque vous utilisez l'épée pour attaquer une cible qui se trouve dans une lumière faible ou dans les ténèbres, vous effectuez l'attaque avec un avantage. Si vous laissez tomber l'arme ou la lancez, elle se dissipe à la fin du tour. Par la suite, tant que le sort est actif, vous pouvez utiliser une action bonus pour faire réapparaître l'épée dans votre main.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou 4, les dégâts passent à 3d8. Lorsque vous le lancez en utilisant un emplacement de sort de niveau 5 ou 6, les dégâts passent à 4d8. Lorsque vous le lancez en utilisant un emplacement de sort de niveau 7 ou plus, les dégâts passent à 5d8.<br>"
	},
	{
		name: "Lame du désastre",
		originalName: "Blade of Disaster",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "a0baaabe-22ca-43a1-8631-68e9519ab2a0",
		level: 9,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "18 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Réalise 2 attaques de sort au CàC et inflige 4d12 dégâts de force. Critique (18-20) inflige 12d12. +2 attaques via action bonus."
	},
	{
		name: "Lenteur",
		originalName: "Slow",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "52e75595-d7f6-4bf0-8c32-b6d085ff4c46",
		level: 3,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (une goutte de mélasse)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous altérez le temps pour un maximum de six créatures de votre choix dans un cube de 12 mètres d'arête à portée. Chaque cible doit réussir un jet de sauvegarde de Sagesse ou être affectée par le sort pendant sa durée.<br>Une créature affectée voit sa vitesse divisée par deux, subit un malus de -2 à sa CA et à ses jets de sauvegarde de Dextérité et ne peut utiliser de réactions. À son tour, elle ne peut utiliser qu'une action ou une action bonus, pas les deux. Peu importe ses capacités ou objets magiques, la créature ne peut effectuer plus d'une attaque au corps à corps ou à distance pendant son tour.<br>Si la créature tente de lancer un sort qui a un temps d'incantation d'une action, lancer un d20. Sur un résultat supérieur ou égal à 11, le sort ne pourra pas prendre effet avant la fin de son prochain tour et la créature devra utiliser l'action de ce tour pour compléter le sort. Sinon, le sort est perdu.<br>Une créature affectée par ce sort effectue un jet de sauvegarde de Sagesse à la fin de chacun de ses tours. En cas de réussite, les effets du sort prennent fin.<br>"
	},
	{
		name: "Mains brûlantes",
		originalName: "Burning Hands",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "5eb812b4-ea68-4324-b302-6046e8544207",
		level: 1,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (cône de 4,50 mètres)",
		components: "V, S",
		duration: "instantanée",
		description: "En tendant vos mains, les pouces en contact et les doigts écartés, un mince rideau de flammes gicle du bout de tous vos doigts tendus. Toute créature se trouvant dans le cône de 4,50 mètres doit effectuer un jet de sauvegarde de Dextérité. La créature subit 3d6 dégâts de feu en cas d'échec, ou la moitié de ces dégâts en cas de réussite. Le feu embrase tous les objets inflammables qui se trouvent dans la zone d'effet et qui ne sont pas tenus ou portés.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts augmentent de 1d6 pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Minuscules météores de Melf",
		originalName: "Melf's Minute Meteors",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "1e9e98a6-1135-4dbc-90d1-5affdb6b3d19",
		level: 3,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (du salpêtre, du soufre et du goudron de pin sous forme de bille)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous créez six météores minuscules dans votre espace. Ils flottent dans l'air et orbitent autour de vous pour la durée du sort. Quand vous lancez le sort (et au prix d'une action bonus à chacun de vos tours par la suite) vous pouvez utiliser un ou deux des météores et les envoyer vers un point ou des points que vous choisissez dans un rayon de 36 mètres autour de vous. Lorsque qu'un météore a atteint sa destination ou percute une surface solide, il explose. Chaque créature dans un rayon de 1,50 mètre autour du point d'impact du météore doit faire un jet de sauvegarde de Dextérité, subissant 2d6 dégâts de feu en cas d'échec, ou la moitié de ces dégâts en cas de réussite.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, le nombre de météores créés augmente de deux pour chaque niveau d'emplacement au-delà du niveau 3.<br>"
	},
	{
		name: "Mot de pouvoir douloureux",
		originalName: "Power Word Pain",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "cb975b80-5775-4778-9d07-1aee65de381b",
		level: 7,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V",
		duration: "instantanée",
		description: "La cible (100 pv max) a sa vitesse réduite à 3 m, un désavantage aux d20 et doit faire un JdS de Con. pour lancer des sorts."
	},
	{
		name: "Mur de lumière",
		originalName: "Wall of Light",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "b65ca418-13e3-4965-97d1-5648f855afa8",
		level: 5,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (un miroir à main)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Crée un mur de lumière de 18 x 3 x 1,50 m qui peut infliger 4d8 dégâts radiants à une cible à chaque tour (dégâts/niv)."
	},
	{
		name: "Nuage incendiaire",
		originalName: "Incendiary Cloud",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "3275a858-c727-4219-8272-8ec248bb874a",
		level: 8,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "45 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Un nuage tournoyant de fumée et projetant des braises incandescentes apparaît dans une sphère de 6 mètres de rayon centrée sur un point à portée. Le nuage contourne les angles et est fortement obscurci. Il reste en place pour toute la durée du sort, ou jusqu'à ce qu'un vent modéré ou fort (au moins 15 km/h) le disperse.<br>Lorsque le nuage apparaît, chaque créature présente à l'intérieur doit effectuer un jet de sauvegarde de Dextérité. Une créature subit 10d8 dégâts de feu en cas d'échec, ou la moitié de ces dégâts en cas de réussite. Une créature doit également effectuer un jet de sauvegarde lorsqu'elle pénètre dans la zone du sort pour la première fois de son tour, ou si elle y termine son tour.<br>Le nuage s'éloigne de 3 mètres de vous dans la direction de votre choix, et ce au début de chacun de vos tours.<br>"
	},
	{
		name: "Nuage mortel",
		originalName: "Cloudkill Brume mortelle",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "3b1c7553-9ad5-4d81-9aeb-37b4d1d4200f",
		level: 5,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous créez une sphère de 6 mètres de rayon remplie d'un brouillard toxique verdâtre, centré sur un point dans la portée du sort. Le brouillard contourne les coins. Il persiste pour la durée du sort ou jusqu'à ce qu'un vent fort le disperse, mettant ainsi fin au sort. La visibilité de la zone est nulle.<br>Lorsqu'une créature pénètre dans la zone du sort pour la première fois ou lorsqu'elle y débute son tour, cette créature doit effectuer un jet de sauvegarde de Constitution, subissant 5d8 dégâts de poison en cas d'échec, ou la moitié de ces dégâts en cas de réussite. Les créatures sont affectées même si elles retiennent leur souffle ou si elles n'ont pas besoin de respirer.<br>Le brouillard s'éloigne de vous au début de votre tour, au rythme de 3 mètres par tour. Il roule sur la surface du sol. La vapeur toxique étant plus lourde que l'air, elle descend dans les creux du relief et elle s'infiltre dans les ouvertures.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 6 ou supérieur, les dégâts augmentent de 1d8 pour chaque niveau d'emplacement au-delà du niveau 5.<br>"
	},
	{
		name: "Nuée de boules de neige de Snilloc",
		originalName: "Snilloc's Snowball Swarm",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "2044099b-cd65-409d-babb-dcdb1ad030ec",
		level: 2,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (un morceau de glace ou un petit morceau de roche blanc)",
		duration: "instantanée",
		description: "Une rafale de boules de neige magiques apparait à un point que vous choisissez à portée. Chaque créature dans une sphère de 1,50 mètre de rayon centré sur ce point doit faire faire un jet de sauvegarde de Dextérité. Une créature subit 3d6 dégâts de froid en cas d'échec, ou la moitié de ces dégâts en cas de réussite.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, les dégâts augmentent de 1d6 pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Nuée de météores",
		originalName: "Meteor Swarm",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "3d63bb63-e532-469e-94c0-7af6a47c6693",
		level: 9,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "1,5 kilomètre",
		components: "V, S",
		duration: "instantanée",
		description: "Des orbes de feux ardents s'abattent sur le sol à quatre différents points visibles dans la portée du sort. Toute créature à l'intérieur d'une sphère de 12 mètres de rayon centrée sur chaque point doit effectuer un jet de sauvegarde de Dextérité, subissant 20d6 dégâts de feu et 20d6 dégâts contondants en cas d'échec, ou la moitié de ces dégâts en cas de réussite. L'effet de la sphère contourne les coins. Une créature prise dans plus d'une sphère n'est affectée qu'une seule fois.<br>Le sort endommage les objets dans la zone et enflamme les objets inflammables qui ne sont pas portés ou transportés.<br>"
	},
	{
		name: "Orbe chromatique",
		originalName: "Chromatic Orb",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "1adf314c-971a-4d9b-a1cb-09389477e90a",
		level: 1,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (un diamant valant au moins 50 po)",
		duration: "instantanée",
		description: "Vous projetez une sphère d'énergie de 10 cm de diamètre vers une créature que vous pouvez voir dans la portée du sort. Vous choisissez acide, foudre, feu, froid, poison ou tonnerre comme type d'orbe que vous créez. Vous faites ensuite une attaque à distance avec un sort contre la cible. Si l'attaque touche, la créature subit 3d8 dégâts du type préalablement déterminé.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts augmentent de 1d8 pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Pas de tonnerre",
		originalName: "Thunder Step",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "4ef93c5b-a923-4141-a3d0-afc97d496be2",
		level: 3,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V",
		duration: "instantanée",
		description: "Vous vous téléportez dans un espace inoccupé que vous pouvez voir à portée. Immédiatement après votre disparition, un boom tonitruant retentit et chaque créature à 3 mètres ou moins de l'espace que vous avez laissé doit effectuer un jet de sauvegarde de Constitution, subissant 3d10 dégâts de tonnerre en cas d'échec, ou la moitié de ces dégâts en cas de réussite. Le tonnerre peut être entendu jusqu'à 90 mètres de distance. Vous pouvez emporter des objets tant que leur poids ne dépasse pas ce que vous pouvez transporter. Vous pouvez également téléporter une créature volontaire de votre taille ou plus petite avec du matériel, tant que celui-ci de dépasse pas sa capacité de charge. La créature doit être à 1,50 mètre ou moins de vous lorsque vous lancez ce sort, et il doit y avoir un espace inoccupé dans un rayon de 1,50 mètre autour de votre espace de destination pour que la créature apparaisse, sinon la créature reste à sa place.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, les dégâts augmentent de 1d10 pour chaque niveau d'emplacement au-delà du niveau 3.<br>"
	},
	{
		name: "Pas lointain",
		originalName: "Far Step",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "0c50a605-545c-4704-a20d-02195baa61fb",
		level: 5,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "personnelle",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "Téléporte le lanceur à 18 m à chaque round par une action bonus."
	},
	{
		name: "Poigne terreuse de Maximilien",
		originalName: "Maximilian's Earthen Grasp",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "f1ac6bfc-ca16-45a9-bae9-dbfe07651a72",
		level: 2,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (une main miniature sculptée à partir d'argile)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous choisissez un espace inoccupé de 1,50 mètre de côté sur le sol et que vous pouvez voir dans la portée du sort. Une main de taille M fabriquée à partir de terre compactée y émerge et se précipite sur une créature que vous pouvez voir dans un rayon de 1,50 mètre autour d'elle. La cible doit réaliser un jet de sauvegarde de Force. En cas d'échec, la cible subit 2d6 dégâts contondants et est entravée pour la durée du sort.<br>Au prix d'une action, vous pouvez utiliser la main pour écraser la cible retenue, qui doit effectuer un jet de sauvegarde de Force. La cible subit 2d6 dégâts contondants en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br>Pour se libérer, la cible entravée peut utiliser son action pour faire un jet de Force contre le DD de sauvegarde de votre sort. En cas de réussite, la cible s'échappe et n'est plus entravée par la main.<br>Au prix d'une action, vous pouvez atteindre une créature différente avec la main ou la déplacer dans un espace inoccupé différent à portée. La main libère une cible entravée si vous le faite.<br>"
	},
	{
		name: "Portail magique",
		originalName: "Arcane Gate Portail arcanique",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "09e35f75-10af-4aca-b5dc-004667142fd5",
		level: 6,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "150 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous créez des portails de téléportation reliés qui restent ouverts toute la durée du sort. Choisissez deux points au sol que vous pouvez voir, l'un à 3 mètres ou moins de vous et l'autre à 150 mètres ou moins de vous. Un portail circulaire de 3 mètres de diamètre s'ouvre sur chaque point. Si un portail allait s'ouvrir sur un espace occupé par une créature, le sort échoue et l'incantation est perdue.<br>Les portails sont des anneaux luisants en deux dimensions remplis de brumes qui lévitent à quelques centimètres au-dessus des points que vous avez choisis. Un anneau n'est visible que d'un côté (celui de votre choix), ce même côté qui fonctionne comme portail.<br>Toute créature ou objet entrant dans un portail ressort par l'autre portail comme s'ils étaient adjacents l'un de l'autre. Passer au travers d'un portail par le côté non fonctionnel n'a aucun effet. La brume qui remplit chaque portail est opaque et bloque la vision au travers. À votre tour, vous pouvez faire tourner les anneaux par une action bonus de sorte que la face active des portails soit orientée dans une autre direction.<br>"
	},
	{
		name: "Prison mentale",
		originalName: "Mental Prison",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "9b0556f3-0bad-4aff-941c-d54e5eccac64",
		level: 6,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "S",
		duration: "concentration, jusqu'à 1 minute",
		description: "La cible doit réussir un JdS d'Int. ou subir 5d10 dégâts psychiques et se croire entouré par des flammes ou autre danger."
	},
	{
		name: "Projectile magique",
		originalName: "Magic Missile",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "7b726090-5697-4071-bffb-b4d9b886d70e",
		level: 1,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous créez trois fléchettes de force magique d'un bleu lumineux. Chaque fléchette atteint une créature de votre choix que vous pouvez voir et dans la limite de portée du sort. Chaque projectile inflige 1d4 + 1 dégâts de force à sa cible. Les fléchettes frappent simultanément, et peuvent frapper une ou plusieurs créatures.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, il crée une fléchette additionnelle pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Rayon ardent",
		originalName: "Scorching Ray",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "71b0bc28-1423-4337-b1e0-e8cf15b161ed",
		level: 2,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous générez trois rayons de feu et vous les projetez vers des cibles dans la portée du sort. Vous pouvez les projeter sur une ou plusieurs cibles.<br>Effectuez une attaque à distance avec un sort pour chaque rayon. Si elle touche, la cible subit 2d6 dégâts de feu.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, vous générez un rayon supplémentaire pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Rayon empoisonné",
		originalName: "Ray of Sickness",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "10c51d59-5483-4579-8182-eea2fbd9eee4",
		level: 1,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Un rayon d'énergie verdâtre et contagieuse est envoyé en direction d'une créature à portée. Effectuez une attaque à distance avec un sort contre la cible. Si le coup touche, la cible subit 2d8 dégâts de poison et doit effectuer un jet de sauvegarde de Constitution. En cas d'échec, la cible est empoisonnée jusqu'à la fin de votre prochain tour.",
		higherLevel: "Si vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts augmentent de 1d8 pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Rayonnement écoeurant",
		originalName: "Sickening Radiance",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "8b68de34-bfbf-4981-a252-77280fd53150",
		level: 4,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Une lumière tamisée et verdâtre se propage dans une sphère de 9 mètres de rayon centrée sur un point que vous choisissez à portée. La lumière se propage autour des angles et dure jusqu'à la fin du sort. Lorsqu'une créature entre dans la zone du sort pour la première fois pendant un tour ou y commence son tour, elle doit réussir un jet de sauvegarde de Constitution ou subir 4d10 dégâts radiants. Elle perd alors aussi un niveau d'épuisement et émet une faible lumière verdâtre dans un rayon de 1,50 mètres. Cette lumière empêche la créature d'être invisible. La lumière et tous les niveaux d'épuisement causés par ce sort disparaissent lorsque le sort se termine.<br>"
	},
	{
		name: "Rayons prismatiques",
		originalName: "Prismatic Spray Embruns prismatiques",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "3a46c2ea-4bca-4abf-aa8f-5c03f042b1f2",
		level: 7,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (cône de 18 mètres)",
		components: "V, S",
		duration: "instantanée",
		description: "Huit rayons de lumière multicolore émanent de votre main. Chaque rayon est d'une couleur différente et a un pouvoir et un usage différent. Chaque créature se trouvant dans un cône de 18 mètres doit effectuer un jet de sauvegarde de Dextérité. Pour chaque cible, lancez 1d8 pour déterminer la couleur du rayon qui l'affecte.<br><strong>1. Rouge</strong>. La cible subit 10d6 dégâts de feu en cas d'échec à son jet de sauvegarde, ou la moitié de ces dégâts en cas de réussite.<br><strong>2. Orange</strong>. La cible subit 10d6 dégâts d'acide en cas d'échec à son jet de sauvegarde, ou la moitié de ces dégâts en cas de réussite.<br><strong>3. Jaune</strong>. La cible subit 10d6 dégâts de foudre en cas d'échec à son jet de sauvegarde, ou la moitié de ces dégâts en cas de réussite.<br><strong>4. Vert</strong>. La cible subit 10d6 dégâts de poison en cas d'échec à son jet de sauvegarde, ou la moitié de ces dégâts en cas de réussite.<br><strong>5. Bleu</strong>. La cible subit 10d6 dégâts de froid en cas d'échec à son jet de sauvegarde, ou la moitié de ces dégâts en cas de réussite.<br><strong>6. Indigo</strong>. En cas d'échec au jet de sauvegarde, la cible est entravée. Elle doit alors effectuer un jet de sauvegarde de Constitution à la fin de chacun de ses tours. Si elle réussit trois fois son jet de sauvegarde, le sort prend fin. Si elle échoue trois fois son jet de sauvegarde, elle est changée en pierre de manière permanente et soumise à la condition pétrifié. Les succès ou échecs n'ont pas besoin d'être consécutifs ; gardez une trace de vos échecs et de vos réussites à chaque tour jusqu'à ce que vous en ayez 3 dans une catégorie.<br><strong>7. Violet</strong>. En cas d'échec, la cible est aveuglée. Elle doit alors effectuer un jet de sauvegarde de Sagesse au début de votre prochain tour. Si ce nouveau jet de sauvegarde est réussi, l'aveuglement prend fin. Si elle échoue ce nouveau jet de sauvegarde, la créature est transportée dans un autre plan d'existence que le MD choisit et n'est plus aveuglée (typiquement, une créature qui ne se situe pas sur son plan d'origine y est renvoyée, tandis que les autres créatures sont généralement transportées dans le plan Astral ou le plan éthéré).<br><strong>8. Spécial</strong>. La cible est frappée par deux rayons. Relancez deux fois le dé et rejouez tous les 8.<br>"
	},
	{
		name: "Souffle du dragon",
		originalName: "Dragon's Breath",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "9f94db12-fd30-48ad-b0dc-503838f9fd0c",
		level: 2,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "contact",
		components: "V, S, M (un piment)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous touchez une créature consentante et lui donnez le pouvoir de cracher de l'énergie magique de sa bouche, à condition qu'elle en ait une. Choisissez l'un des types de dégâts suivants : acide, froid, feu, foudre ou poison. Jusqu'à la fin du sort, la créature peut utiliser une action pour expirer l'énergie du type choisi dans un cône de 4,50 mètres. Toutes les créatures dans cette zone doivent effectuer un jet de sauvegarde de Dextérité, subissant 3d6 dégâts du type choisi en cas d'échec, ou la moitié de ces dégâts en cas de réussite.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, les dégâts augmentent de 1d6 pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Souhait",
		originalName: "Wish",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "911f37a9-498f-476a-87cb-5f991f722272",
		level: 9,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V",
		duration: "instantanée",
		description: "<em>Souhait</em> est le sort le plus puissant qu'une créature mortelle puisse lancer. Simplement en parlant à haute voix, vous pouvez altérer les fondements mêmes de la réalité selon vos désirs.<br>L'utilisation la plus basique de ce sort est de dupliquer n'importe quel autre sort de niveau 8 ou inférieur. Aucune condition n'est exigée pour ce sort, pas même la nécessité de composantes couteuses. Le sort prend simplement effet. Vous pouvez également créer un des effets suivants de votre choix :<br>• Vous créez un objet non magique d'une valeur maximale de 25 000 po. L'objet ne peut faire plus de 90 mètres d'arête et apparait sur le sol dans un espace inoccupé que vous pouvez voir.<br>• Vous permettez à un maximum de vingt créatures que vous pouvez voir de récupérer tous leurs points de vie et vous dissipez tous les effets les affectant, comme décrit dans le sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=restauration-superieure\">restauration supérieure</a></em>.<br>• Vous accordez à un maximum de dix créatures que vous pouvez voir une résistance à un type de dégâts de votre choix.<br>• Vous accordez à un maximum de dix créatures que vous pouvez voir l'immunité à un sort unique ou un autre effet magique pendant 8 heures. Par exemple, vous pouvez vous immuniser ainsi que vos compagnons contre l'attaque drainante d'une liche.<br>• Vous annulez un événement unique récent en obligeant un nouveau jet de dés en remplacement de n'importe quel jet effectué durant le dernier round (incluant votre dernier tour). La réalité se transforme pour correspondre au nouveau lancer. Par exemple, un sort de <em>souhait</em> peut annuler la réussite d'un jet de sauvegarde ennemi, le coup critique d'un adversaire ou un jet de sauvegarde allié manqué. Vous pouvez imposer un jet avec avantage ou désavantage, et vous pouvez choisir d'utiliser le nouveau résultat du lancer ou l'ancien.<br>Vous pouvez également réaliser d'autres choses que les exemples ci-dessus. Décrivez votre souhait à votre MD de la manière la plus précise possible. Le MD est libre de déterminer ce qui se produit dans ce cas ; plus le souhait est important, plus la probabilité est grande que quelque chose tourne mal. Ce sort pourrait simplement échouer, l'effet que vous souhaitez pourrait être seulement partiellement exécuté, ou vous pourriez subir d'imprévisibles conséquences en fonction de votre formulation du souhait. Par exemple, souhaiter qu'un ennemi soit mort pourrait vous propulser à une époque future où votre ennemi n'est plus vivant, vous éliminant ainsi efficacement du jeu. De la même manière, désirer un objet magique légendaire ou un artéfact pourrait vous transporter instantanément en présence de l'actuel possesseur de l'objet.<br>Le stress de lancer ce sort pour produire un effet autre que la reproduction d'un autre sort vous affaiblit. Après avoir subi cette tension, chaque fois que vous lancez un sort avant d'avoir terminé un repos long, vous subissez 1d10 dégâts nécrotiques par niveau de sort. Ces dégâts ne peuvent être réduits ou évités, d'une quelconque manière. De plus, votre Force tombe à 3, si elle n'est pas déjà inférieure à 3, pendant 2d4 jours. Pour chaque jour passé à vous reposer ou à pratiquer une activité mineure, votre temps de récupération diminue de 2 jours. Enfin, vous avez 33 % de chance de ne plus jamais être capable de lancer le sort <em>souhait</em> si vous avez subi ce stress.<br>"
	},
	{
		name: "Sphère de tempête",
		originalName: "Storm Sphere",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "06f36085-8ae8-4455-bbbe-d2a5f9ea697e",
		level: 4,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "45 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Une sphère de 6 mètres de rayon de vents tourbillonnants centrée sur un point que vous choisissez à portée apparait brusquement. La sphère perdure pour la durée du sort. Chaque créature dans la zone d'apparition ou qui termine son tour à l'intérieur doit réussir un jet de sauvegarde de Force ou subir 2d6 dégâts contondants. L'espace de la sphère est un terrain difficile.<br>Jusqu'à ce que le sort se termine, vous pouvez utiliser une action bonus à chacun de vos tours pour lancer un éclair qui part du centre de la sphère vers une créature que vous choisissez dans les 18 mètres de celui-ci. Faites une attaque à distance avec un sort. Vous avez un avantage au jet d'attaque si la cible est dans la sphère. En cas de réussite, la cible subit 4d6 dégâts de foudre.<br>Les créatures à 9 mètres ou moins de la sphère ont un désavantage à leurs jets de Sagesse (Perception) pour écouter.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 5 ou supérieur, les dégâts augmentent de 1d6 pour chaque niveau d'emplacement au-delà du niveau 4.<br>"
	},
	{
		name: "Sphère de vitriol",
		originalName: "Vitriolic Sphere",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "2833afca-a3eb-4631-9c58-cdba94cb5fbf",
		level: 4,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "45 mètres",
		components: "V, S, M (une goutte de bile de limace géante)",
		duration: "instantanée",
		description: "Vous visez un endroit à portée du sort, et une balle brillante d'acide émeraude de 30 cm de diamètre y file pour y exploser sur dans une shpère de 6 mètres de rayon. Chaque créature dans cette zone doit effectuer un jet de sauvegarde de Dextérité. En cas d'échec, la créature subit 10d4 dégâts d'acide puis 5d4 dégâts d'acide à la fin de son prochain tour. En cas de réussite, la créature subit la moitié des dégâts initiaux et aucun à la fin de son prochain tour.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 5 ou supérieur, les dégâts initiaux augmentent de 2d4 pour chaque niveau d'emplacement au-delà du niveau 4.<br>"
	},
	{
		name: "Télékinésie",
		originalName: "Telekinesis",
		castedBy: [
			"sorcerer",
			"wizard"
		],
		id: "56c814e3-739b-403e-a15c-29bb067613af",
		level: 5,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous obtenez la capacité de déplacer ou manipuler les créatures ou les objets par la pensée. Lorsque vous lancez ce sort, et par une action à chaque tour pour la durée du sort, vous pouvez user de votre volonté sur une créature ou un objet que vous pouvez voir et à portée, générant l'effet correspondant (voir ci-dessous). Vous pouvez affecter la même cible tour après tour, ou en choisir une nouvelle à tout moment. Si vous changez de cible, la cible précédente n'est plus affectée par le sort.<br><strong><em>Créature</em></strong>. Vous pouvez essayer de déplacer une créature de taille TG ou inférieure. Effectuez un jet de caractéristique avec votre caractéristique d'incantation contre un jet de Force de la créature. Si vous gagnez l'opposition, vous déplacez la créature jusqu'à 9 mètres dans n'importe quelle direction, même vers le haut, mais pas au-delà de la portée du sort. Jusqu'à la fin de votre prochain tour, la créature est entravée par votre emprise télékinétique. Une créature envoyée en hauteur est suspendue au milieu des airs. Lors des tours suivants, vous pouvez utiliser votre action pour tenter de maintenir votre emprise télékinétique sur la créature en effectuant un nouveau jet d'opposition.<br><strong><em>Objet</em></strong>. Vous pouvez essayer de déplacer un objet dont le poids ne dépasse pas les 500 kg. Si l'objet n'est pas porté ou tenu, vous le déplacez automatiquement jusqu'à 9 mètres dans n'importe quelle direction, dans la limite de la portée du sort. Si l'objet est porté ou tenu par une créature, vous devez effectuer un jet de caractéristique avec votre caractéristique d'incantation copntre un jet de Force de la créature. Si vous gagnez l'opposition, vous arrachez l'objet à la créature et pouvez le déplacer de 9 mètres dans toutes les directions, dans les limites de la portée du sort.<br>Vous pouvez exercer un contrôle fin sur les objets avec votre emprise télékinétique, comme manipuler un objet simple, ouvrir une porte ou un contenant, déposer ou récupérer un objet d'un contenant ouvert, ou déverser le contenu d'une fiole.<br>"
	},
	{
		name: "Ténèbres",
		originalName: "Darkness",
		castedBy: [
			"sorcerer",
			"warlock",
			"wizard"
		],
		id: "1ae691db-55ed-48e6-82d1-aaf2ec77b27e",
		level: 2,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, M (des poils de chauve-souris et une goutte de goudron ou un morceau de charbon)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Des ténèbres magiques s'étendent d'un point de votre choix dans la portée du sort pour remplir une sphère de 4,50 mètres de rayon pour la durée du sort. Ces ténèbres contournent les coins. Une créature avec la vision dans le noir ne peut percer ces ténèbres et une lumière non magique ne peut y éclairer.<br>Si le point choisi est un objet que vous portez ou qui n'est pas porté ou transporté, les ténèbres émanent de l'objet et elles se déplacent avec lui. Recouvrir complètement la source des ténèbres avec un objet opaque, comme un bol ou un casque, bloque les ténèbres.<br>Si n'importe quelle portion de ce sort chevauche une portion de lumière créée par un sort de niveau 2 ou moins, le sort de lumière est alors dissipé.<br>"
	},
	{
		name: "Armure d'Agathys",
		originalName: "Armor of Agathys",
		castedBy: [
			"warlock"
		],
		id: "d5394455-7585-4050-bf5d-80f3dffcf307",
		level: 1,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (une coupe d'eau)",
		duration: "1 heure",
		description: "Une force magique protectrice vous entoure, se manifestant sous la forme d'un givre spectral vous couvrant vous et votre équipement. Vous obtenez 5 points de vie temporaires pour la durée du sort. Si une créature vous touche avec une attaque au corps à corps alors que vous avez ces points de vie temporaires, la créature subit 5 dégâts de froid.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les points de vie temporaires et les dégâts de froid augmentent de 5 pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Cage des âmes",
		originalName: "Soul Cage",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "64478ade-24f0-471d-836d-6bab9fc81c62",
		level: 6,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 reaction, which you take when a humanoid you can see within 60 feet of you dies",
		range: "18 mètres",
		components: "V, S, M (une petite cage d'argent d'une valeur d'au moins 100 po)",
		duration: "8 heures",
		description: "Vole une âme pour gagner des pv, lui poser des questions, obtenir l'avantage à un dé ou voir un lieu qu'elle connaissait."
	},
	{
		name: "Contact avec un autre plan",
		originalName: "Contact Other Plane Contact avec les plans",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "765e6739-48de-4c92-9ef3-3e7c4b4acd8f",
		level: 5,
		school: "divination",
		isRitual: true,
		castingTime: "1 minute",
		range: "personnelle",
		components: "V",
		duration: "1 minute",
		description: "Vous contactez mentalement un demi-dieu, l'esprit d'un sage depuis longtemps disparu, ou quelque autre mystérieuse entité d'un autre plan. Rentrer en contact avec cette intelligence extraplanaire peut épuiser voire briser votre esprit. Lorsque vous lancez ce sort, effectuez un jet de sauvegarde d'Intelligence DD 15. En cas d'échec, vous subissez 6d6 dégâts psychiques et devenez dément jusqu'à ce que vous finissiez un repos long. Tant que vous êtes fou, vous ne pouvez utiliser d'action, vous ne pouvez pas non plus comprendre ce que les autres créatures disent, ni lire, et tout ce que vous dites n'est qu'un charabia incompréhensible. Un sort de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=restauration-superieure\">restauration supérieure</a></em> lancé sur vous peut mettre fin à cet effet.<br>Sur un jet de sauvegarde réussi, vous pouvez poser à l'entité jusqu'à cinq questions. Vous devez poser vos questions avant que le sort ne finisse. Le MD répond à chacune de ces questions par un seul mot, comme « oui », « non », « peut-être », « jamais », « insignifiant » ou « flou » (si l'entité ne connaît pas la réponse à la question). Si une réponse en un mot risque d'être source de confusion, le MD peut donner une courte phrase en guise de réponse.<br>"
	},
	{
		name: "Convocation d'aberration",
		originalName: "Summon Aberration",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "6a55788e-c78f-49d9-b515-15389123cd71",
		level: 4,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (un tentacule mariné et un globe oculaire dans un flacon incrusté de platine d'une valeur d'au moins 400 po)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Invoque 1 esprit d'aberration (tyrannoeil, slaad ou rejeton stellaire) amical (bloc stat/votre niv)."
	},
	{
		name: "Convocation de démon supérieur",
		originalName: "Summon Greater Demon Invocation de démon supérieur",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "5d065e4f-f539-434c-9d0a-06aac362a749",
		level: 4,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (une fiole de sang d'humanoïde tué au cours des dernières 24 heures)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous prononcez des mots vulgaires, invoquant un démon du chaos des Abysses. Choisissez le type du démon, qui doit être de FP 5 ou inférieur, comme un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=demon-des-ombres\">démon des ombres</a> ou un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=barlgura\">barlgura</a>. Le démon apparaît dans un espace inoccupé que vous pouvez voir à portée, et il disparaît lorsqu'il tombe à 0 point de vie ou lorsque le sort se termine.<br>Lancer l'initiative pour le démon, qui a ses propres tours. Lorsque vous l'invoquez et à chacun de vos tours par la suite, vous pouvez lui donner un ordre verbal (aucune action n'est requise de votre part) pour lui indiquer ce qu'il doit faire lors de son prochain tour. Si vous ne donnez aucun ordre, il passe son tour à attaquer toute créature à sa portée qui l'a attaquée. À la fin de chacun des tours de démons, il effectue un jet de sauvegarde de Charisme. Le démon a un désavantage sur ce jet de sauvegarde si vous dites son vrai nom. En cas d'échec de sauvegarde, le démon continue de vous obéir. En cas de sauvegarde réussie, votre contrôle du démon prend fin pour le reste de la durée, et le démon passe son tour à poursuivre et à attaquer les non-démons les plus proches au mieux de ses capacités. Si vous arrêtez de vous concentrer sur le sort avant qu'il n'atteigne sa durée totale, un démon incontrôlé disparaît après 1d6 rounds s'il a encore des points de vie. Dans le cadre du lancement du sort, vous pouvez former un cercle au sol avec le sang utilisé comme composant matériel. Le cercle est suffisamment grand pour englober votre espace. Tant que le sort dure, le démon invoqué ne peut pas traverser le cercle ou lui faire du mal, et il ne peut cibler personne à l'intérieur. Utiliser le composant matériel de cette manière le consomme à la fin du sort.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 5 ou supérieur, le FP augmente de 1 pour chaque niveau d'emplacement au-delà du niveau 4.<br>"
	},
	{
		name: "Convocation de démons inférieurs",
		originalName: "Summon Lesser Demons Invocation de démons inférieurs",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "7ebd09f3-8d87-4e22-83ad-388cd4e6d50b",
		level: 3,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (une fiole de sang d'humanoïde tué au cours des dernières 24 heures)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous prononcez des mots vulgaires, invoquant des démons du chaos des Abysses. Jetez un dé sur la table suivante pour déterminer ce qui apparaît.<br><table><tbody><tr><th>d6</th><th>Démons invoqués</th></tr><tr><td>1-2</td><td>Deux démons de FP 1 ou moins</td></tr><tr><td>3-4</td><td>Quatre démons de FP 1/2 ou moins</td></tr><tr><td>5-6</td><td>Huit démons de FP 1/4 ou moins</td></tr><tr></tr></tbody></table><br>Le MD choisit les démons, comme les <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=mane\">mânes</a> ou les <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=dretch\">dretchs</a>, et vous choisissez les espaces inoccupés que vous pouvez voir à portée où ils apparaissent. Un démon invoqué disparaît lorsqu'il tombe à 0 point de vie ou lorsque le sort se termine.<br>Les démons sont hostiles à toutes les créatures, vous y compris. Lancez l'initiative pour le groupe de démons invoqués ; il a ses propres tours de jeu. Les démons poursuivent et attaquent les non-démons les plus proches au mieux de leurs capacités. Dans le cadre de l'action Lancer un sort, vous pouvez tracer un cercle au sol avec le sang utilisé comme composante matérielle. Le cercle doit être suffisamment grand pour englober votre espace. Tant que le sort dure, les démons invoqués ne peuvent pas traverser le cercle, ni le détruire, ni cibler quelqu'un à l'intérieur du cercle. Utiliser la composante matérielle de cette manière la consomme à la fin du sort.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 6 ou 7, vous invoquez deux fois plus de démons. Si vous le lancez en utilisant un emplacement de sort de niveau 8 ou 9, vous invoquez trois fois plus de démons.<br>"
	},
	{
		name: "Convocation de fiélon",
		originalName: "Summon Fiend",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "2f417ac3-c273-436f-8e9a-837c6a3d16b4",
		level: 6,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (du sang d'un humanoïde dans un flacon en rubis d'une valeur d'au moins 600 po)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Invoque 1 esprit de fiélon (démon, diable ou yugoloth) amical (bloc stat/votre niv)."
	},
	{
		name: "Convocation de mort-vivant",
		originalName: "Summon Undead",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "b00ed529-a1a7-4984-b1a7-81861761eb7e",
		level: 3,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (un crâne doré d'une valeur d'au moins 300 po)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Invoque 1 esprit de mort-vivant (fantomatique, putride ou squelettique) amical (bloc stat/votre niv)."
	},
	{
		name: "Convocation de rejeton d'ombre",
		originalName: "Summon Shadowspawn",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "0b25b597-0d2c-450a-b19a-ff063e0b8e3a",
		level: 3,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (des larmes à l'intérieur d'une gemme d'une valuer d'au moins 300 po)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Invoque 1 esprit de rejeton d'ombre (fureur, désespoir ou peur) amical (bloc stat/votre niv)."
	},
	{
		name: "Danse macabre",
		originalName: "Danse Macabre",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "126d925d-a841-499b-a8eb-178945898630",
		level: 5,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 heure",
		description: "Jusqu'à 5 corps de taille M ou P deviennent des zombies ou des squelettes sous le contrôle du lanceur (+2 corps/niv)."
	},
	{
		name: "Décharge occulte",
		originalName: "Eldritch Blast",
		castedBy: [
			"warlock"
		],
		id: "0af49ba0-8110-4c8d-93c0-01ddac78fbc8",
		level: 0,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Un rayon d'énergie crépitante zigzague jusqu'à une créature à portée. Effectuez une attaque à distance avec un sort contre la cible. En cas de réussite, la cible subit 1d10 dégâts de force.<br>Ce sort crée plus d'un rayon lorsque vous montez en niveau : deux rayons au niveau 5, trois rayons au niveau 11, et quatre rayons au niveau 17. Vous pouvez diriger les rayons sur une cible unique et les répartir entre différentes créatures. Effectuez un jet d'attaque séparé pour chaque rayon.<br>"
	},
	{
		name: "Déluge d'énergie négative",
		originalName: "Negative Energy Flood",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "b03b96df-72ff-45e1-b811-84079a43ce87",
		level: 5,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, M (un os cassé et un carré de soie noire)",
		duration: "instantanée",
		description: "La cible doit réussir un JdS de Con. ou subir 5d12 dégâts nécrotiques. Morte, la cible devient un zombie."
	},
	{
		name: "Demi-plan",
		originalName: "Demiplane",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "23b61820-2b11-462e-a326-ff21defa9872",
		level: 8,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "S",
		duration: "1 heure",
		description: "Vous créez une porte d'ombres sur une surface plate et solide, que vous pouvez voir et à portée. La porte est suffisamment large pour permettre à des créatures de taille M de l'emprunter sans difficulté. Lorsqu'elle est ouverte, la porte conduit à un demi-plan qui semble être une salle vide de 9 mètres (en longueur, largeur et hauteur), faite de bois ou de pierres. Lorsque le sort se termine, la porte disparaît, et toute créature ou objet encore à l'intérieur du demi-plan y reste piégé, étant donné que la porte disparaît également de l'autre côté.<br>Chaque fois que vous lancez ce sort, vous pouvez créer un nouveau demi-plan, ou faire en sorte que la porte d'ombre que vous faites apparaître soit connectée avec un demi-plan que vous avez précédemment créé grâce à ce sort. De plus, si vous connaissez la nature et le contenu d'un demi-plan créé, via ce sort, par une autre créature, vous pouvez plutôt faire en sorte que votre porte d'ombre soit connectée à ce demi-plan.<br>"
	},
	{
		name: "Emprisonnement",
		originalName: "Imprisonment",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "19894991-b19d-4042-b272-ea7e3db5f07f",
		level: 9,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 minute",
		range: "9 mètres",
		components: "V, S, M (une représentation de vélin ou une statuette sculptée à l'effigie de la cible, et une composante spéciale qui varie en fonction de la version du sort que vous choisissez, d'une valeur d'au moins 500 po par dés de vie de la cible)",
		duration: "jusqu'à dissipation",
		description: "Vous créez une contrainte magique qui maintient prisonnière une créature que vous pouvez voir dans la portée du sort. La cible doit réussir un jet de sauvegarde de Sagesse ou être retenue par le sort. Si elle réussit, elle est à l'abri de ce sort si vous le lui lancez à nouveau. Lorsqu'elle est affectée par ce sort, la créature n'a pas besoin de respirer, de manger ou de boire, et elle ne vieillit pas. Les sorts de divination ne peuvent pas localiser ou percevoir la cible. Quand vous lancez le sort, choisissez l'une des formes d'emprisonnement suivantes.<br><strong><em>Enterrement</em></strong>. La cible est ensevelie profondément sous la terre dans une sphère de force magique juste assez grande pour la contenir. Rien ne peut passer à travers la sphère, et aucune créature ne peut se téléporter ou utiliser les voyages planaires pour entrer ou sortir de celle-ci.<br>La composante spéciale pour cette version du sort est un petit orbe de mithral.<br><strong><em>Enchaînement</em></strong>. De lourdes chaînes, bien ancrées au sol, maintiennent la cible en place. La cible est entravée jusqu'à ce que le sort prenne fin, et elle ne peut pas se déplacer ou être déplacée par quelconques moyens pendant ce temps.<br>La composante spéciale pour cette version du sort est une fine chaîne d'un métal précieux.<br><strong><em>Prison enclavée</em></strong>. Le sort transporte la cible dans un tout petit demi-plan qui est protégé contre la téléportation et le voyage planaire. Le demi-plan peut être un labyrinthe, une cage, une tour, ou toute structure similaire de confinement ou autre zone de votre choix.<br>La composante spéciale pour cette version du sort est une représentation miniature en jade de la prison.<br><strong><em>Confinement minimus</em></strong>. La cible rétrécit jusqu'à une hauteur de 2,50 cm et est emprisonnée à l'intérieur d'une pierre précieuse ou autre objet similaire. La lumière peut passer à travers la pierre normalement (permettant ainsi à la cible de voir à l'extérieur et à d'autres créatures de voir à l'intérieur), mais rien d'autre ne peut passer à travers, même par des moyens de téléportation ou des voyages planaires. La pierre précieuse ne peut pas être taillée ou cassée tant que le sort est en vigueur.<br>La composante spéciale pour cette version du sort est une grande pierre précieuse transparente, telle qu'un corindon, un diamant ou un rubis.<br><strong><em>Sommeil éternel</em></strong>. La cible s'endort et ne peut pas être réveillée.<br>La composante spéciale pour cette version du sort se compose d'herbes soporifiques rares.<br><strong><em>Terminer le sort</em></strong>. Lors de l'incantation du sort, quelle que soit sa version, vous pouvez spécifier une condition qui provoque la fin du sort et libérera ainsi la cible. La condition peut être aussi spécifique ou complexe que vous le souhaitez, mais le MD doit convenir que la condition est raisonnable et qu'elle a une probabilité de survenir. Les conditions peuvent être basées sur le nom, l'identité ou le dieu d'une créature, mais également sur des actions ou des qualités observables, et non sur des éléments intangibles tels que le niveau, la classe ou les points de vie.<br>Un sort de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=dissipation-de-la-magie\">dissipation de la magie</a></em> ne peut mettre un terme au sort que s'il est lancé avec un emplacement de sort de niveau 9, ciblant soit la prison, soit la composante spéciale utilisée pour la créer.<br>Vous ne pouvez utiliser une composante spéciale particulière que pour créer une seule prison à la fois. Si vous lancez le sort à nouveau en utilisant la même composante, la cible de la première incantation est immédiatement libérée de ses entraves.<br>"
	},
	{
		name: "Frayeur",
		originalName: "Cause Fear",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "f9f1c086-5fc6-4aef-8b5b-ec0fc8272ab7",
		level: 1,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous éveillez le sens de la mortalité chez une créature que vous pouvez voir à portée. Les morts-vivants et les artificiels sont immunisés contre cet effet. La cible doit réussir un jet de sauvegarde de Sagesse ou être effrayée jusqu'à ce que le sort se termine. La cible effrayée peut répéter le jet de sauvegarde à la fin de chacun de ses tours, mettant fin à l'effet sur elle-même en cas de réussite.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, vous pouvez cibler une créature supplémentaire pour chaque niveau d'emplacement au-delà du niveau 1. Les créatures doivent être à 9 mètres ou moins les unes des autres lorsque vous les ciblez.<br>"
	},
	{
		name: "Glas funèbre",
		originalName: "Toll the Dead Sonner le glas",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "d0e526b5-8677-46bc-8176-966f7fffdb9a",
		level: 0,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous pointez une créature que vous pouvez voir à portée, et le son douloureux d'une cloche emplit l'air autour d'elle pendant un moment. La cible doit réussir un jet de sauvegarde de Sagesse ou subir 1d8 dégâts nécrotiques. Si la cible n'est pas à son maximum de points de vie, elle subit 1d12 de dégâts nécrotiques.<br>Les dégâts du sort augmentent de un dé lorsque vous atteignez le niveau 5 (2d8 ou 2d12), le niveau 11 (3d8 ou 3d12) et le niveau 17 (4d8 ou 4d12).<br>"
	},
	{
		name: "Invocation infernale",
		originalName: "Infernal Calling",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "834e0abf-e56b-441d-9a6e-f14cda7f5423",
		level: 5,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 minute",
		range: "27 mètres",
		components: "V, S, M (un rubis d'une valeur d'au moins 999 po)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Invoque 1 diable FP 6 hostile (+1 FP/niv)"
	},
	{
		name: "Maléfice",
		originalName: "Hex",
		castedBy: [
			"warlock"
		],
		id: "eec635d7-a6a1-489e-a25d-96b8d638a5b1",
		level: 1,
		school: "enchantment",
		isRitual: false,
		castingTime: "1 action bonus",
		range: "27 mètres",
		components: "V, S, M (l'œil pétrifié d'un triton)",
		duration: "concentration, jusqu'à 1 heure",
		description: "Vous placez une malédiction sur une créature à portée que vous pouvez voir. Jusqu'à la fin du sort vous infligez 1d6 dégâts nécrotiques supplémentaires à la cible à chaque fois que vous la touchez lors d'une attaque. De plus, choisissez une caractéristique lorsque vous lancez le sort. La cible obtient un désavantage aux jets de caractéristique effectués avec la caractéristique en question.<br>Si la cible tombe à 0 point de vie avant que le sort ne se termine, vous pouvez utiliser votre action bonus lors d'un tour suivant pour maudire une nouvelle créature.<br>Une <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=delivrance-des-maledictions\">délivrance des malédictions</a></em> lancée sur la cible met fin au sort prématurément.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou 4, vous pouvez maintenir votre concentration sur ce sort pendant 8 heures. Si vous utilisez un emplacement de sort de niveau 5 ou supérieur, vous pouvez maintenir votre concentration sur ce sort pendant 24 heures.<br>"
	},
	{
		name: "Ombre d'égarement",
		originalName: "Shadow of Moil",
		castedBy: [
			"warlock"
		],
		id: "64bffa51-1910-4b21-9e78-4fc563a4c939",
		level: 4,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (un globe oculaire de mort-vivant enfermé dans une gemme d'une valeur d'au moins 150 po)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Des ombres en formes de flammes enveloppent votre corps jusqu'à la fin du sort. Vous êtes alors dans une zone de visibilité nulle pour les autres. Les ombres transforment la lumière faible dans une rayon de 3 mètres en ténèbres, et la lumière vive dans la même zone en lumière faible. Jusqu'à la fin du sort, vous avez la résistance aux dégâts radiants. De plus, chaque fois qu'une créature à 3 mètres ou moins de vous vous touche avec une attaque, les ombres s'en prennent à cette créature et lui infligent 2d8 dégâts nécrotiques.<br>"
	},
	{
		name: "Pétrification",
		originalName: "Flesh to Stone",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "8c6e906b-456e-479b-ab10-673d2b6d2cad",
		level: 6,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (une pincée de chaux, de l'eau, et un peu de terre)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous tentez de changer en pierre une créature que vous pouvez voir et à portée. Si le corps de la cible est fait de chair, la créature doit effectuer un jet de sauvegarde de Constitution. Si elle échoue, elle est entravée car sa chair commence à durcir. Si elle réussit, la créature n'est pas affectée.<br>Une créature entravée par ce sort doit effectuer un nouveau de jet de sauvegarde de Constitution à la fin de chacun de ses tours. Si elle réussit trois fois son jet de sauvegarde contre ce sort, le sort prend fin. Si elle échoue trois fois son jet de sauvegarde contre ce sort, elle est changée en pierre et soumise à la condition pétrifié pour toute la durée du sort. Les succès ou échecs n'ont pas besoin d'être consécutifs ; conservez une trace du résultat de chaque jet jusqu'à ce que la cible cumule trois échecs ou trois réussites.<br>Si la créature est physiquement brisée tandis qu'elle est pétrifiée, elle souffre de difformités similaires lorsqu'elle retourne à son état original.<br>Si vous maintenez votre concentration sur ce sort pendant sa durée maximale, la créature est changée en pierre jusqu'à ce que cet effet soit dissipé.<br>"
	},
	{
		name: "Rayon affaiblissant",
		originalName: "Ray of Enfeeblement",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "9d03d9fe-188f-4a52-bd30-73d0fc036cc3",
		level: 2,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Un rayon noir d'énergie négative s'échappe de votre doigt en direction d'une créature à portée. Effectuez une attaque à distance avec un sort contre la cible. Si le coup touche, la cible n'inflige plus que demi-dégâts lorsqu'elle attaque avec une arme utilisant la Force, et ce jusqu'à la fin du sort.<br>À la fin de chacun de ses tours, la cible effectue un jet de sauvegarde de Constitution contre le sort. En cas de réussite, le sort prend fin.<br>"
	},
	{
		name: "Représailles infernales",
		originalName: "Hellish Rebuke",
		castedBy: [
			"warlock"
		],
		id: "80782cf7-ae3f-4ad8-bdd2-161b6c556303",
		level: 1,
		school: "evocation",
		isRitual: false,
		castingTime: "1 réaction, que vous prenez après avoir subi des dégâts par une créature située à 18 mètres maximum de vous et que vous pouvez voir.",
		range: "18 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous pointez votre doigt, et la créature qui vous a infligé des dégâts est momentanément entourée de flammes infernales. La créature doit effectuer un jet de sauvegarde de Dextérité, subissant 2d10 dégâts de feu en cas d'échec, ou la moitié de ces dégâts en cas de réussite.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts sont augmentés de 1d10 pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Ténèbres oppressantes",
		originalName: "Maddening Darkness",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "9f408556-02bb-4e65-8aca-8d85cf5930b4",
		level: 8,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "45 mètres",
		components: "V, M (une goutte de poix mélangée à une goutte de mercure)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Les créatures dans une sphère de ténèbres de 18 m de rayon doivent réussir un JdS de Sag. ou subir 8d8 dégâts psychiques."
	},
	{
		name: "Tentacules de Hadar",
		originalName: "Arms of Hadar",
		castedBy: [
			"warlock"
		],
		id: "fd137434-9b58-4336-8cf7-3d8fb4186916",
		level: 1,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle (rayon de 3 mètres)",
		components: "V, S",
		duration: "instantanée",
		description: "Vous invoquez le pouvoir de Hadar, la Sombre Famine. <br>Des sarments d'énergie noire jaillissent de vous et frappent toutes les créatures se trouvant à 3 mètres ou moins de vous. Toute créature dans cette zone doit effectuer un jet de sauvegarde de Force. En cas d'échec, la cible subit 2d6 dégâts nécrotiques et ne peut pas utiliser de réaction jusqu'à son prochain tour. En cas de réussite, la cible subit la moitié de ces dégâts et ne souffre pas d'effets supplémentaires. ",
		higherLevel: "Si vous lancez ce sort en utilisant un emplacement de sort de niveau 2 ou supérieur, les dégâts augmentent de 1d6 pour chaque niveau d'emplacement au-delà du niveau 1.<br>"
	},
	{
		name: "Toucher du vampire",
		originalName: "Vampiric Touch Caresse du vampire",
		castedBy: [
			"warlock",
			"wizard"
		],
		id: "f794c0f6-5d48-4fb9-8067-f6f560081558",
		level: 3,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Le contact de votre main nimbée d'ombres peut aspirer la force vitale des autres et soigner vos plaies. Effectuez une attaque au corps à corps avec un sort contre une créature à votre portée. Si vous touchez, la cible subit 3d6 dégâts nécrotiques, et vous récupérez un nombre de points de vie égal à la moitié des dégâts nécrotiques infligés. Jusqu'à la fin du sort, vous pouvez attaquer de nouveau à chacun de vos tours en utilisant une action.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, les dégâts augmentent de 1d6 pour chaque niveau d'emplacement au-delà du niveau 3.<br>"
	},
	{
		name: "Voracité de Hadar",
		originalName: "Hunger of Hadar",
		castedBy: [
			"warlock"
		],
		id: "c9ca6671-ec44-48d3-992d-8ae3c8fcca1a",
		level: 3,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "45 mètres",
		components: "V, S, M (un tentacule de pieuvre mariné)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous ouvrez une passerelle dans l'obscurité qui règne entre les étoiles, vers une région infestée d'horreurs inconnues. Une sphère de ténèbres et de froid mordant de 6 mètres de rayon apparaît, centrée sur un point à portée et reste en place pour toute la durée du sort. Ce néant est empli d'une cacophonie de faibles murmures et de bruits d'aspiration qui peut être entendue à 9 mètres à la ronde. Aucune lumière, magique comme naturelle, ne peut illuminer la zone, et les créatures qui se trouvent complètement dans la zone sont aveuglées.<br>Le néant altère et déforme la trame de l'espace, la zone est alors considérée comme un terrain difficile. Toute créature qui commence son tour dans la zone subit 2d6 dégâts de froid. Toute créature qui termine son tour dans la zone doit effectuer un jet de sauvegarde de Dextérité, subissant 2d6 dégâts d'acide du fait des tentacules laiteuses venant de l'autre monde qui se frottent contre elle en cas d'échec.<br>"
	},
	{
		name: "Appel de familier",
		originalName: "Find Familiar",
		castedBy: [
			"wizard"
		],
		id: "62ce6f7a-885a-410e-81ab-5d6dae5bbf5b",
		level: 1,
		school: "conjuration",
		isRitual: true,
		castingTime: "1 heure",
		range: "3 mètres",
		components: "V, S, M (du charbon de bois, de l'encens, et des herbes pour une valeur de totale minimum de 10 po, le tout étant consumé par le feu dans un chaudron en laiton)",
		duration: "instantanée",
		description: "Vous gagnez les services d'un familier, un esprit qui prend la forme d'un animal de votre choix : une <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=araignee\">araignée</a>, une <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=belette\">belette</a>, un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=chat\">chat</a>, une <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=chauve-souris\">chauve-souris</a>, une <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=chouette\">chouette</a>, un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=corbeau\">corbeau</a>, un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=crabe\">crabe</a>, un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=faucon\">faucon</a>, un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=hippocampe\">hippocampe</a>, une <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=grenouille\">grenouille</a> (crapaud), un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=lezard\">lézard</a>, une <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=pieuvre\">pieuvre</a>, un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=rat\">rat</a>, un poisson (<a href=\"https://www.aidedd.org/dnd/monstres.php?vf=piranha\">piranha</a>) ou un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=serpent-venimeux\">serpent venimeux</a>. Apparaissant dans un espace inoccupé à portée, le familier a les statistiques de la forme choisie mais est du type céleste, fée ou fiélon (au choix), au lieu du type bête.<br>Votre familier agit de manière indépendante, mais obéit toujours à vos ordres. En combat, il lance sa propre initiative et agit au cours de ses propres tours de jeu. Un familier ne peut pas attaquer, mais il peut utiliser normalement les autres actions.<br>Lorsqu'un familier tombe à 0 point de vie, il disparaît, ne laissant derrière lui aucune forme physique. Il réapparaît lorsque vous lancez de nouveau ce sort.<br>Lorsque votre familier se trouve à 30 mètres de vous maximum, vous pouvez communiquer avec lui par télépathie. De plus, par une action, vous pouvez voir au travers des yeux du familier et entendre ce qu'il entend jusqu'au début de votre prochain tour, bénéficiant alors des sens spéciaux de votre familier, s'il en a. Au cours de cette période, vous êtes considéré comme étant sourd et aveugle (en ce qui concerne vos propres sens).<br>Par une action, vous pouvez temporairement renvoyer votre familier. Il disparaît dans une poche dimensionnelle, de laquelle il attend votre rappel. Vous pouvez sinon le renvoyer pour toujours. Par une action, alors que votre familier est temporairement renvoyé, vous pouvez le faire réapparaître dans un espace inoccupé situé à 9 mètres de vous maximum.<br>Vous ne pouvez pas avoir plus d'un familier à la fois. Si vous lancez ce sort alors que vous possédez déjà un familier, votre familier actuel prend une nouvelle forme. Choisissez cette nouvelle forme parmi celles présentées dans la liste ci-dessus. Votre familier prend alors la forme de la créature choisie.<br>Enfin, lorsque vous lancez un sort qui a une portée de contact, votre familier peut lancer le sort comme s'il était celui qui avait réalisé l'incantation. Votre familier doit se situer à 30 mètres de vous maximum, et doit utiliser sa réaction pour lancer le sort au moment où vous l'incantez. Si le sort requiert un jet d'attaque, vous utilisez votre modificateur à l'attaque pour ce jet.<br>"
	},
	{
		name: "Assassin imaginaire",
		originalName: "Phantasmal Killer",
		castedBy: [
			"wizard"
		],
		id: "da273fd0-a86e-4727-97da-87c215cb0d60",
		level: 4,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Vous exploitez les cauchemars d'une créature à portée que vous pouvez voir et créez une manifestation illusoire de ses plus grandes peurs, visible uniquement de cette créature. La cible doit effectuer un jet de sauvegarde de Sagesse. Si elle l'échoue, la cible est effrayée pour la durée du sort. À la fin de chacun de ses tours avant que le sort ne prenne fin, la cible doit réussir un jet de sauvegarde de Sagesse ou subir 4d10 dégâts psychiques. En cas de réussite, le sort prend fin.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 5 ou supérieur, les dégâts sont augmentés de 1d10 pour chaque niveau d'emplacement au-delà du niveau 4.<br>"
	},
	{
		name: "Aube",
		originalName: "Dawn",
		castedBy: [
			"wizard"
		],
		id: "6f65b218-0de6-4524-ba09-a219c3b7075e",
		level: 5,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S, M (un pendentif en forme de rayons de soleil d'une valeur d'au moins 100 po)",
		duration: "concentration, jusqu'à 1 minute",
		description: "Les créatures dans un cylindre de 9 x 12 m doivent réussir un JdS de Con. ou subir 4d10 dégâts radiants."
	},
	{
		name: "Aura magique de Nystul",
		originalName: "Nystul's Magic Aura",
		castedBy: [
			"wizard"
		],
		id: "e7aa0417-5a54-4469-a7cb-2318f584fa27",
		level: 2,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (un petit carré de soie)",
		duration: "24 heures",
		description: "Vous placez une illusion sur une créature ou un objet que vous touchez pour que les sorts de divination révèlent de fausses informations les concernant. La cible peut être une créature consentante ou un objet qui n'est pas tenu ou équipé par une autre créature.<br>Lorsque vous lancez le sort, choisissez l'un ou les deux effets suivants. L'effet reste en place pour la durée du sort. Si vous lancez ce sort sur la même créature ou le même objet tous les jours pendant 30 jours, en choisissant à chaque fois le même effet, l'illusion reste active jusqu'à ce que le sort soit dissipé.<br><strong>Fausse aura</strong>. Vous modifiez la manière dont la cible apparaît aux sorts et effets magiques, comme le sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=detection-de-la-magie\">détection de la magie</a></em>, qui détectent les auras magiques. Vous pouvez faire en sorte qu'un objet non magique semble magique, et vice versa, ou modifier l'aura magique d'un objet pour qu'elle semble appartenir à une autre école de magie de votre choix. Lorsque vous utilisez cet effet sur un objet, vous pouvez faire en sorte que cette fausse aura soit visible pour toute créature qui tient l'objet en main.<br><strong>Masque</strong>. Vous modifiez la manière dont la cible apparaît aux sorts et effets magiques qui détectent le type d'une créature, comme le Sens divin du paladin ou le déclencheur du sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=symbole\">symbole</a></em>. Vous choisissez un type de créature, les autres sorts et effets magiques traitent la cible comme si elle était de ce type ou de cet alignement.<br>"
	},
	{
		name: "Bouclier de feu",
		originalName: "Fire Shield",
		castedBy: [
			"wizard"
		],
		id: "98d6b950-b9ba-49da-836f-79b5f7119296",
		level: 4,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (un peu de phosphore ou une luciole)",
		duration: "10 minutes",
		description: "De fines et vaporeuses flammes cernent votre corps pour la durée du sort, irradiant une lumière vive dans un rayon de 3 mètres et une lumière faible à trois mètres supplémentaires. Vous pouvez mettre fin au sort en utilisant une action pour le faire disparaitre.<br>Les flammes forment autour de vous un bouclier de chaleur ou de froid, à votre choix. Le bouclier de chaleur vous confère une résistance aux dégâts de froid et celui de froid une résistance aux dégâts de feu.<br>De plus, si une créature située à 1,50 mètre ou moins de vous vous touche avec une attaque au corps à corps, des flammes jaillissent du bouclier. L'attaquant subit alors 2d8 dégâts de feu ou de froid, selon le modèle choisi.<br>"
	},
	{
		name: "Clone",
		originalName: "Clone",
		castedBy: [
			"wizard"
		],
		id: "9271d059-535d-4098-94ce-6f6fed5dbb76",
		level: 8,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 heure",
		range: "contact",
		components: "V, S, M (un diamant d'une valeur d'au moins 1 000 po et au moins 1 cube de 2,50 cm d'arête de chair de la créature qui doit être clonée, que le sort consomme, et un récipient d'une valeur d'au moins 2 000 po qui a un couvercle scellable et qui est suffisamment grand pour contenir une créature de taille M, comme une grande urne, un coffre, un kyste rempli de boue sur le sol ou un contenant en cristal rempli d'eau salée)",
		duration: "instantanée",
		description: "Ce sort crée le double inerte d'une créature vivante, servant de protection contre la mort. Ce clone se forme à l'intérieur d'un récipient scellé et atteint sa taille maximale et sa maturité au bout de 120 jours ; vous pouvez également choisir d'avoir un clone d'une version plus jeune de la même créature. Ce clone reste inerte et persiste indéfiniment, tant que son contenant n'est pas dérangé.<br>À n'importe quel moment, une fois le clone mature, si la créature originale meurt, son âme est transférée dans le clone, à condition que l'âme soit libre et qu'elle soit consentante à son retour à la vie. Le clone est physiquement identique à l'original et a la même personnalité, les mêmes souvenirs, et les mêmes caractéristiques, mais pas l'équipement d'origine. Le corps original de la créature reste où il est, s'il existe encore, il devient inerte et ne peut revenir à la vie tant que son âme est ailleurs.<br>"
	},
	{
		name: "Convocations instantanées de Drawmij",
		originalName: "Drawmij's Instant Summons",
		castedBy: [
			"wizard"
		],
		id: "7e2dfdbc-5c54-43d6-8894-06a4bd19a76a",
		level: 6,
		school: "conjuration",
		isRitual: true,
		castingTime: "1 minute",
		range: "contact",
		components: "V, S, M (un saphir valant au moins 1 000 po)",
		duration: "jusqu'à dissipation",
		description: "Vous touchez un objet pesant au mieux 5 kg dont chacune des dimensions ne peut dépasser 1,80 mètre. Le sort dépose une marque invisible à sa surface et écrit, toujours de manière invisible, le nom de l'objet sur le saphir que vous avez utilisé comme composante matérielle. Chaque fois que vous lancez ce sort, vous devez utiliser un saphir différent.<br>Par la suite, n'importe quand, vous pouvez utiliser votre action pour prononcer le nom de l'objet et broyer le saphir. L'objet apparaît instantanément dans votre main, quels que soient la distance ou les plans qui vous séparent. Le sort prend alors fin.<br>Si une autre créature porte ou tient l'objet, briser le saphir ne téléporte pas l'objet jusqu'à vous mais vous informe de qui le possède actuellement et où cette créature se trouve en ce moment.<br>Le sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=dissipation-de-la-magie\">dissipation de la magie</a></em>, ou un effet similaire, lancé avec succès sur le saphir met fin à l'effet du sort.<br>"
	},
	{
		name: "Création d'homoncule",
		originalName: "Create Homunculus",
		castedBy: [
			"wizard"
		],
		id: "354ca9fe-26a7-4a84-b392-6ca1ff8e0bdd",
		level: 6,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 heure",
		range: "contact",
		components: "V, S, M (de l'argile, des cendres et des racines de mandragore, qui sont tous consommés par le sort, et un poignard incrusté de joyaux d'une valeur d'au moins 1 000 po)",
		duration: "instantanée",
		description: "Crée un homunculus auquel le lanceur peut transférer ses points de vie jusqu'à son prochain repos long."
	},
	{
		name: "Dédale",
		originalName: "Maze",
		castedBy: [
			"wizard"
		],
		id: "ae530afe-6fe5-4406-9c87-4e91f8cb67c6",
		level: 8,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous bannissez une créature visible dans la portée du sort vers un labyrinthe d'un demi-plan. La cible y demeure pour la durée du sort ou jusqu'à ce qu'elle s'évade du dédale.<br>La cible peut utiliser son action pour tenter de s'évader. Dans ce cas, elle effectue un jet d'Intelligence DD 20. Si elle réussit, elle s'évade et le sort prend fin (un minotaure ou un démon goristro réussissent automatiquement).<br>Lorsque le sort prend fin, la cible réapparait dans l'espace qu'elle avait quitté. Si celui-ci est occupé, elle apparait dans l'espace inoccupé le plus proche.<br>"
	},
	{
		name: "Disque flottant de Tenser",
		originalName: "Tenser's Floating Disk",
		castedBy: [
			"wizard"
		],
		id: "b346a11d-a3c8-4146-84a5-d09bff0bee99",
		level: 1,
		school: "conjuration",
		isRitual: true,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (une goutte de mercure)",
		duration: "1 heure",
		description: "Ce sort crée un plateau de force horizontal et circulaire, de 90 cm de diamètre et épais de 2,50 cm, qui flotte 90 cm au-dessus du sol dans un espace inoccupé de votre choix, à portée et que vous pouvez voir. Le disque reste en place pour la durée du sort et peut supporter 250 kg. Si plus de poids est placé sur le disque, le sort prend fin, et tout ce qui se trouve sur le disque tombe sur le sol.<br>Le disque est immobile tant que vous vous trouvez à 6 mètres de lui. Si vous vous déplacez à plus de 6 mètres, le disque vous suit jusqu'à se retrouver de nouveau à 6 mètres de vous. Il peut se déplacer au-dessus de n'importe quel type de terrain, monter et descendre les escaliers, les pentes et tout ce qui y ressemble, mais il ne peut effectuer un changement brutal d'altitude égal ou supérieur à 3 mètres. Par exemple, le disque ne peut pas se déplacer au-dessus d'un gouffre de 3 mètres de profondeur, ou il ne peut pas sortir d'un gouffre de 3 mètres de haut s'il a été invoqué au fond.<br>Si vous vous déplacez à plus de 30 mètres du disque (par exemple parce qu'il ne peut pas passer au-dessus d'un obstacle pour vous suivre), le sort prend fin.<br>"
	},
	{
		name: "Dissimulation",
		originalName: "Sequester Dissimulation suprême",
		castedBy: [
			"wizard"
		],
		id: "e4b07f7a-99d0-4c29-9e42-77811c96bd06",
		level: 7,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "contact",
		components: "V, S, M (une poudre composée de poussières de diamant, d'émeraude, de rubis, et de saphir d'une valeur d'au moins 5 000 po, que le sort consomme)",
		duration: "jusqu'à dissipation",
		description: "Grâce à ce sort, une créature consentante ou un objet peut être caché, et ainsi protégé contre la détection pour toute la durée du sort. Lorsque vous lancez ce sort et touchez la cible, elle devient invisible et ne peut pas être ciblée par les sorts de divination ou détectée grâce à des capteurs créés par des sorts de divination.<br>Si la cible est une créature, elle sombre dans un état d'animation suspendue. Pour elle, le temps cesse de s'écouler, et elle ne vieillit pas.<br>Vous pouvez placer une condition pour que le sort prenne fin prématurément. Vous pouvez choisir ce que vous souhaitez comme condition, mais elle doit survenir ou être visible à 1,5 kilomètre ou moins de la cible. La condition pourrait être, par exemple, « Après 1 000 ans » ou « Lorsque la tarasque s'éveille ». Ce sort prend également fin si la cible subit des dégâts.<br>"
	},
	{
		name: "Dragon illusoire",
		originalName: "Illusory Dragon",
		castedBy: [
			"wizard"
		],
		id: "654a8cfa-b838-477d-85bf-eaf72522bc30",
		level: 8,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Les créatures qui voient le dragon illusoire de taille TG doivent réussir un JdS de Sag. ou être effrayées durant 1 min."
	},
	{
		name: "Ennemi subconscient",
		originalName: "Weird",
		castedBy: [
			"wizard"
		],
		id: "d48ff8c5-20ff-4ba1-a7e9-ad16d34c2322",
		level: 9,
		school: "illusion",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S",
		duration: "concentration, jusqu'à 1 minute",
		description: "Puisant dans les peurs les plus profondes d'un groupe de créatures, vous créez des créatures illusoires dans leur esprit, qu'elles sont les seules à voir. Chaque créature se trouvant dans une sphère de 9 mètres de rayon centrée sur un point de votre choix et à portée, doit effectuer un jet de sauvegarde de Sagesse. En cas d'échec, la créature devient effrayée pour toute la durée du sort. L'illusion fait appel aux peurs les plus profondes de la créature, donnant vie à ses pires cauchemars, telle une menace implacable. À la fin de chacun de ses tours, la créature affectée doit réussir un jet de sauvegarde de Sagesse ou subir 4d10 dégâts psychiques. En cas de réussite, le sort prend fin pour cette créature.<br>"
	},
	{
		name: "Flèche acide de Melf",
		originalName: "Melf's Acid Arrow",
		castedBy: [
			"wizard"
		],
		id: "880c1857-5594-4ad0-8ab7-665a457ceb9a",
		level: 2,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (une feuille de rhubarbe en poudre et un estomac de vipère)",
		duration: "instantanée",
		description: "Une flèche verte scintillante jaillit en direction d'une cible à portée et l'asperge d'acide. Effectuez une attaque à distance avec un sort contre la cible. Si l'attaque touche, la cible subit 4d4 dégâts d'acide immédiatement et 2d4 dégâts d'acide à la fin de son prochain tour. En cas d'échec, la flèche asperge la cible avec de l'acide, ne lui infligeant que la moitié des dégâts initiaux et aucun dégât à la fin de son prochain tour.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 3 ou supérieur, les dégâts (initiaux et à retardement) sont augmentés de 1d4 pour chaque niveau d'emplacement au-delà du niveau 2.<br>"
	},
	{
		name: "Forteresse majestueuse",
		originalName: "Mighty Fortress",
		castedBy: [
			"wizard"
		],
		id: "c0d50fb5-5f2c-4d70-a267-e69b7b7138f4",
		level: 8,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 minute",
		range: "1,5 kilomètre",
		components: "V, S, M (un diamant d'une valeur d'au moins 500 po, que le sort consomme)",
		duration: "instantanée",
		description: "Fait apparaitre une forteresse de pierre sur une surface de 36 x 36 m pour 7 jours."
	},
	{
		name: "Invulnérabilité",
		originalName: "Invulnerability",
		castedBy: [
			"wizard"
		],
		id: "092bd887-46ad-4459-b8b4-06aba208d199",
		level: 9,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (une petite pièce en adamantium d'une valeur d'au moins 500 po, que le sort consomme)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Le lanceur gagne l'immunité à tous les dégàts."
	},
	{
		name: "Lien télépathique de Rary",
		originalName: "Rary's Telepathic Bond",
		castedBy: [
			"wizard"
		],
		id: "c9b600ec-c0af-4fd8-b82d-8b2c6d3c7026",
		level: 5,
		school: "divination",
		isRitual: true,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (des coquilles d'œufs pondus par des créatures d'espèces différentes)",
		duration: "1 heure",
		description: "Vous tissez un lien télépathique unissant jusqu'à huit créatures consentantes de votre choix et à portée, chacune psychiquement liée aux autres pour toute la durée du sort. Les créatures ayant une valeur d'Intelligence inférieure ou égale à 2 ne peuvent pas être affectées par ce sort.<br>Jusqu'à ce que le sort prenne fin, les cibles peuvent communiquer télépathiquement via ce lien, qu'elles aient ou non une langue en commun. La communication est possible quelle que soit la distance qui sépare les cibles, mais elle ne fonctionne plus pour des créatures se trouvant sur différents plans d'existence.<br>"
	},
	{
		name: "Monture fantôme",
		originalName: "Phantom Steed",
		castedBy: [
			"wizard"
		],
		id: "3953dfee-90f0-4e33-9570-6fc3e480af40",
		level: 3,
		school: "illusion",
		isRitual: true,
		castingTime: "1 minute",
		range: "9 mètres",
		components: "V, S",
		duration: "1 heure",
		description: "Une créature semi-réelle de taille G ressemblant à un cheval apparaît, à portée, sur le sol dans un espace inoccupé de votre choix. Vous décidez de l'apparence de la créature, elle est cependant équipée d'une selle, de mors et d'une bride. Tout l'équipement créé grâce à ce sort disparaît dans un nuage de fumée s'il est éloigné à plus de 3 mètres de la monture.<br>Pour toute la durée du sort, vous, ou une créature de votre choix, pouvez chevaucher la monture. La créature utilise les statistiques d'un <a href=\"https://www.aidedd.org/dnd/monstres.php?vf=cheval-de-selle\">cheval de selle</a>, à l'exception de sa vitesse de déplacement qui est de 30 mètres, il peut également parcourir 15 kilomètres en une heure, ou 20 kilomètres s'il voyage à un rythme rapide. Lorsque le sort prend fin, la monture disparaît progressivement, donnant 1 minute à son cavalier pour mettre pied à terre. Le sort se termine si vous utilisez votre action pour le dissiper ou si la monture subit des dégâts.<br>"
	},
	{
		name: "Mur de force",
		originalName: "Wall of Force",
		castedBy: [
			"wizard"
		],
		id: "f9138882-17b9-4523-8401-216b06d33f79",
		level: 5,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (une pincée de poudre réalisée en pilant une pierre semi-précieuse translucide)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Un mur de force invisible apparaît en un point de votre choix à portée. Le mur prend l'orientation que choisissez, comme une barrière verticale, horizontale, ou avec angle. Il peut flotter librement dans les airs ou s'appuyer sur une surface solide. Vous pouvez lui donner la forme d'un dôme hémisphérique ou d'une sphère ayant un rayon de 3 mètres maximum, ou lui donner la forme d'une surface plane constituée de dix panneaux de 3 mètres de côté chacun. Chaque panneau doit être contigu à un autre panneau. Quelle que soit sa forme, le mur a une épaisseur de 6 millimètres. Il reste en place pendant toute la durée du sort. Si le mur traverse l'espace occupé par une créature lorsqu'il apparaît, la créature est repoussée d'un côté du mur (vous choisissez le côté).<br>Rien ne peut traverser physiquement le mur. Il est immunisé à tous les types de dégâts et ne peut être dissipé avec un sort de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=dissipation-de-la-magie\">dissipation de la magie</a></em>. Cependant, un sort de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=desintegration\">désintégration</a></em> détruit le mur instantanément. Le mur est également présent dans le plan éthéré, bloquant les voyages éthérés au travers du mur.<br>"
	},
	{
		name: "Mur de glace",
		originalName: "Wall of Ice",
		castedBy: [
			"wizard"
		],
		id: "69bd201b-a428-46aa-8a06-0fced468ec59",
		level: 6,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "36 mètres",
		components: "V, S, M (un petit morceau de quartz)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous créez un mur de glace sur une surface solide à portée. Vous pouvez lui donner la forme d'un dôme hémisphérique ou d'une sphère de 3 mètres de rayon maximum, ou bien lui donner la forme d'une surface plane composée de 10 panneaux de 3 mètres de côté chacun, chaque panneau devant être contigu à un autre panneau. Quelle que soit sa forme, le mur est épais de 30 cm et reste en place pendant toute la durée du sort.<br>Si le mur traverse l'espace occupé par une créature lorsqu'il apparaît, la créature est repoussée d'un côté du mur et doit effectuer un jet de sauvegarde de Dextérité. La créature subit 10d6 dégâts de froid en cas d'échec, ou la moitié de ces dégâts en cas de réussite.<br>Le mur est un objet qui peut être endommagé, il est donc possible d'y créer une brèche. Il possède une CA de 12 et 30 points de vie par section de 3 mètres, et est vulnérable aux dégâts de feu. Réduire une section de 3 mètres à 0 point de vie la détruit et laisse place à un voile d'air glacial à l'endroit que le mur occupait. Une créature se déplaçant au travers de ce voile glacial pour la première fois de son tour doit effectuer un jet de sauvegarde de Constitution. La créature subit 5d6 dégâts de froid en cas d'échec, ou la moitié de ces dégâts en cas de réussite.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 7 ou supérieur, les dégâts qu'inflige le mur lorsqu'il apparaît augmentent de 2d6, et les dégâts infligés aux créatures qui traversent le voile d'air glacial augmentent de 1d6, pour chaque niveau d'emplacement au-delà du niveau 6.<br>"
	},
	{
		name: "Mur de sable",
		originalName: "Wall of Sand",
		castedBy: [
			"wizard"
		],
		id: "43d498ca-7b20-4a90-91bd-f9cc8436fdbf",
		level: 3,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (une poignée de sable)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "Vous créez un mur de sable tourbillonnant sur le sol à un point que vous pouvez voir à portée. Vous pouvez créer un mur mesurant jusqu'à 9 mètres de long, 3 mètres de haut et 3 mètres d'épaisseur, qui disparaîtra à la fin du sort. Il bloque la ligne de vue, mais pas le déplacement. Une créature est aveuglée tant qu'elle se trouve dans l'espace occupé par le mur et doit dépenser 3 mètres de mouvement pour 1 mètre parcouru dans celui-ci.<br>"
	},
	{
		name: "Mur prismatique",
		originalName: "Prismatic Wall",
		castedBy: [
			"wizard"
		],
		id: "f01a0d9e-c92c-4982-a609-a3b8333e7918",
		level: 9,
		school: "abjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "18 mètres",
		components: "V, S",
		duration: "10 minutes",
		description: "Un plan de lumières multicolores et chatoyantes forme un mur vertical et opaque (jusqu'à 27 mètres de long, 9 mètres de haut et 2,50 cm d'épaisseur) centré sur un point que vous pouvez voir et à portée. Vous pouvez sinon donner au mur la forme d'une sphère de 9 mètres de diamètre centrée sur un point que vous choisissez à portée. Le mur reste en place pour toute la durée du sort. Si vous placez le mur de sorte qu'il traverse l'espace occupé par une créature, le sort échoue, et votre action et l'emplacement du sort sont dépensés pour rien.<br>Le mur émet une lumière vive sur 30 mètres et une lumière faible sur 30 mètres supplémentaires. Vous, et les créatures que vous désignez au moment où vous lancez le sort, pouvez passer au travers ou rester à côté du mur sans en être affecté. Si une autre créature qui peut voir le mur se déplace à 6 mètres du mur (ou moins) ou débute son tour dans cette zone, elle doit réussir un jet de sauvegarde de Constitution sous peine d'être aveuglée pendant 1 minute.<br>Le mur est constitué de sept couches, chacune ayant une couleur différente. Lorsqu'une créature tente de pénétrer ou de traverser le mur, elle ne passe qu'une couche à la fois sur toutes les couches du mur. À chaque fois qu'elle passe une couche du mur, la créature doit réussir un jet de sauvegarde de Dextérité sous peine d'être affectée par le pouvoir de la couche en question (voir ci-dessous).<br>Le mur peut être détruit, une couche à la fois dans l'ordre indiqué ci-dessous (du rouge au violet), et d'une manière spécifique pour chaque couche. Une fois qu'une couche est détruite, elle le reste pour toute la durée du sort. <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=champ-antimagie\">Champ antimagie</a></em> n'a aucun effet sur le mur et <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=dissipation-de-la-magie\">dissipation de la magie</a></em> n'affecte que la couche violette.<br><strong>1. Rouge</strong>. La créature subit 10d6 dégâts de feu en cas d'échec à son jet de sauvegarde, ou la moitié de ces dégâts en cas de réussite. Tant que cette couche est en place, les attaques à distance non magiques ne peuvent pas passer au travers du mur. La couche peut être détruite en lui infligeant au moins 25 points de dégâts de froid.<br><strong>2. Orange</strong>. La créature subit 10d6 dégâts de feu en cas d'échec à son jet de sauvegarde, ou la moitié de ces dégâts en cas de réussite. Tant que cette couche est en place, les attaques à distance magiques ne peuvent pas passer au travers du mur. La couche est détruite par un vent fort.<br><strong>3. Jaune</strong>. La créature subit 10d6 dégâts de foudre en cas d'échec à son jet de sauvegarde, ou la moitié de ces dégâts en cas de réussite. Cette couche peut être détruite en lui infligeant au moins 60 points de dégâts de force.<br><strong>4. Vert</strong>. La créature subit 10d6 dégâts de poison en cas d'échec à son jet de sauvegarde, ou la moitié de ces dégâts en cas de réussite. Un sort de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=passe-muraille\">passe-muraille</a></em>, ou tout autre sort de niveau égal ou supérieur permettant d'ouvrir un portail sur une surface solide, détruit cette couche.<br><strong>5. Bleu</strong>. La créature subit 10d6 dégâts de froid en cas d'échec à son jet de sauvegarde, ou la moitié de ces dégâts en cas de réussite. Cette couche peut être détruite en lui infligeant 25 points de dégâts de feu.<br><strong>6. Indigo</strong>. En cas d'échec au jet de sauvegarde, la créature est entravée. Elle doit réussir un jet de sauvegarde de Constitution à la fin de chacun de ses tours. Si elle réussit trois fois son jet de sauvegarde, le sort prend fin. Si elle échoue trois fois son jet de sauvegarde, elle est changée en pierre de manière permanente et soumise à la condition pétrifié. Les réussites ou les échecs n'ont pas besoin d'être consécutifs ; conservez une trace des résultats de vos tours passés jusqu'à ce que vous cumuliez trois réussites ou trois échecs.<br>Tant que cette couche est en place, les sorts ne peuvent être lancés au travers du mur. Cette couche est détruite par une importante source de lumière vive, comme celle émise par le sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=lumiere-du-jour\">lumière du jour</a></em>, ou n'importe quel sort similaire d'un niveau égal ou supérieur.<br><strong>7. Violet</strong>. En cas d'échec au jet de sauvegarde, la créature est aveuglée. Elle doit alors réussir un jet de sauvegarde de Sagesse au début de votre prochain tour. Si elle réussit ce nouveau jet de sauvegarde, elle n'est plus aveuglée. Si elle échoue ce nouveau jet de sauvegarde, la créature est transportée dans un autre plan d'existence que le MD choisit, et n'est plus aveuglée (typiquement, une créature qui ne se trouve pas dans son plan d'existence originel y est renvoyée, tandis que les autres créatures sont généralement envoyées dans le plan Astral ou le plan éthéré). Cette couche peut être détruite par un sort de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=dissipation-de-la-magie\">dissipation de la magie</a></em> ou tout autre sort similaire d'un niveau supérieur ou égal qui peut mettre un terme aux sorts ou aux effets magiques.<br>"
	},
	{
		name: "Passe-muraille",
		originalName: "Passwall",
		castedBy: [
			"wizard"
		],
		id: "66bb1a59-3c7f-4539-b193-b1210b9e7da3",
		level: 5,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S, M (une pincée de graine de sésame)",
		duration: "1 heure",
		description: "Un passage apparaît à un endroit de votre choix que vous pouvez voir sur une surface en bois, en plâtre ou en pierre (tel qu'un mur, un plancher ou un plafond) à portée, et disparaît à la fin du sort. Vous choisissez la taille de l'ouverture (jusqu'à 1,50 mètre de large, 2,50 mètres de haut et 6 mètres de profondeur. Le passage n'engendre pas d'instabilité dans la structure environnante.<br>Quand l'ouverture disparaît, toutes créatures ou tous objets encore présents dans le passage créé se retrouvent éjectés sans dommage vers un endroit non occupé près de la surface sur laquelle a été lancé le sort.<br>"
	},
	{
		name: "Prévoyance",
		originalName: "Contingency Anticipation",
		castedBy: [
			"wizard"
		],
		id: "c5ba8140-2513-4bae-8bbe-b833ae5f30f6",
		level: 6,
		school: "evocation",
		isRitual: false,
		castingTime: "10 minutes",
		range: "personnelle",
		components: "V, S, M (une statuette vous représentant, sculptée dans l'ivoire et incrustée de pierres précieuses d'une valeur d'au moins 1 500 po)",
		duration: "10 jours",
		description: "Choisissez un sort de niveau 5 ou inférieur que vous pouvez lancer, qui a une durée d'incantation de 1 action et qui peut vous cibler. Vous lancez ce sort (appelé sort conditionné) au cours du lancement du sort <em>prévoyance</em>. Vous dépensez les emplacements de sorts des deux sorts, mais le sort conditionné ne prend pas effet immédiatement ; il ne prend effet que lorsque certaines circonstances ont lieu. Vous déterminez ces circonstances lorsque vous lancez ces deux sorts. Par exemple, <em>prévoyance</em> lancé avec le sort <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=respiration-aquatique\">respiration aquatique</a></em> pourrait stipuler que <em>respiration aquatique</em> ne prend effet que lorsque vous êtes complètement immergé dans l'eau ou tout autre liquide similaire.<br>Le sort conditionné prend effet immédiatement après que les conditions de déclenchement ne soient remplies pour la première fois, que vous le vouliez ou non, ce qui met fin au sort <em>prévoyance</em>.<br>Le sort conditionné ne prend effet que sur vous, même s'il peut normalement cibler d'autres créatures. Vous ne pouvez utiliser qu'un seul sort de <em>prévoyance</em> à la fois. Si vous lancez ce sort de nouveau, l'effet du sort <em>prévoyance</em> déjà actif sur vous se termine. Le sort <em>prévoyance</em> se termine également si vous ne portez plus sa composante matérielle sur vous.<br>"
	},
	{
		name: "Simulacre",
		originalName: "Simulacrum",
		castedBy: [
			"wizard"
		],
		id: "4e0d093e-9342-41de-ba0d-f53871d819b8",
		level: 7,
		school: "illusion",
		isRitual: false,
		castingTime: "12 heures",
		range: "contact",
		components: "V, S, M (de la neige ou de la glace en quantité suffisante pour créer un double moitié moins grand de la créature à dupliquer ; quelques cheveux, des bouts d'ongles, ou tout autre fragment du corps de la créature placé dans la neige ou la glace ; et de la poudre de rubis valant au moins 1 500 po, répandue sur le double, et que le sort consomme)",
		duration: "jusqu'à dissipation",
		description: "Vous créez un clone illusoire d'une bête ou d'un humanoïde se trouvant à portée pendant toute la durée de l'incantation du sort. Le clone est une créature partiellement réelle, formée de glace et de neige, qui peut agir et être affectée comme une créature normale. La copie semble être identique à l'originale, mais elle ne possède que la moitié du maximum de points de vie de la créature et est créée sans aucun équipement. Sinon, la créature utilise toutes les statistiques de la créature dupliquée, mis à part que c'est un artificiel.<br>Le simulacre a une attitude amicale avec vous et toute créature que vous désignez. Il obéit à vos ordres verbaux, se déplace et agit selon vos souhaits et agit pendant votre tour au cours des combats. Le simulacre n'a pas la capacité d'apprendre ou de devenir plus puissant, il ne monte donc jamais de niveau, n'améliore pas ses capacités, ni ne peut récupérer un emplacement de sort dépensé.<br>Si le simulacre subit des dégâts, vous pouvez le réparer dans un laboratoire d'alchimie, en utilisant des herbes et des minerais rares valant au moins 100 po par point de vie récupéré. Le simulacre persiste jusqu'à ce qu'il tombe à 0 point de vie, à ce moment-là il reprend sa forme de neige et fond instantanément.<br>Si vous lancez ce sort de nouveau, tout clone actuellement actif que vous avez créé grâce à ce sort est instantanément détruit.<br>"
	},
	{
		name: "Sphère glaciale d'Otiluke",
		originalName: "Otiluke's Freezing Sphere Sphère glacée d'Otiluke",
		castedBy: [
			"wizard"
		],
		id: "0c0a892e-a78b-46d6-b6c9-3c18a0fb0974",
		level: 6,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "90 mètres",
		components: "V, S, M (une petite sphère de cristal)",
		duration: "instantanée",
		description: "Un globe d'énergie glaciale est projeté du bout de votre doigt vers un point de votre choix, à portée, où il explose en une sphère d'un rayon de 18 mètres. Chaque créature se trouvant dans la zone doit effectuer un jet de sauvegarde de Constitution, subissant 10d6 dégâts de froid en cas de réussite, ou la moitié de ces dégâts en cas de réussite.<br>Si le globe percute une masse d'eau ou un liquide composé principalement d'eau (à l'exception des créatures constituées d'eau), il gèle le liquide sur une profondeur de 15 cm et une étendue de 2,7 m² (une case mesurant 2,25 m²). La glace reste en place pendant 1 minute. Les créatures qui étaient en train de nager à la surface de l'eau gelée son piégées par la glace. Une créature piégée peut utiliser son action pour effectuer un jet de Force contre le DD de sauvegarde de votre sort pour se libérer.<br>Si vous le souhaitez, vous pouvez vous abstenir de tirer le globe une fois que vous avez fini d'incanter le sort. Un petit globe de la taille d'une pierre à fronde, froid au toucher, apparaît alors dans votre main. À n'importe quel moment, vous, ou une autre créature à qui vous avez donné le globe, pouvez le lancer (avec une portée de 12 mètres) ou le projeter avec une fronde (la portée du globe devient celle de la fronde). Il se brise à l'impact, avec les mêmes effets que s'il avait été lancé directement suite à l'incantation du sort. Vous pouvez également poser le globe au sol sans le briser. Au bout d'une minute, si le globe n'est toujours pas brisé, il explose.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 7 ou supérieur, les dégâts augmentent de 1d6 pour chaque niveau d'emplacement au-delà du niveau 6.<br>"
	},
	{
		name: "Télépathie",
		originalName: "Telepathy",
		castedBy: [
			"wizard"
		],
		id: "bcd93165-f160-4b65-b2f4-8ac672b7cf53",
		level: 8,
		school: "evocation",
		isRitual: false,
		castingTime: "1 action",
		range: "illimitée",
		components: "V, S, M (une paire d'anneaux d'argent liés)",
		duration: "24 heures",
		description: "Vous créez un lien télépathique entre vous et une créature consentante qui vous est familière. La créature peut être n'importe où sur le même plan d'existence que vous. Le sort prend fin si vous n'êtes plus tous les deux sur le même plan d'existence.<br>Jusqu'à ce que le sort prenne fin, vous et la cible pouvez échanger instantanément des mots, des images, des sons et tout autre message sensoriel entre vous. La cible qui reçoit le message sait qu'il vient de vous. Le sort permet à une créature ayant une valeur d'Intelligence de 1 au minimum de comprendre la signification de vos mots et de saisir le sens des messages sensoriels que vous lui envoyez.<br>"
	},
	{
		name: "Tentacules noirs d'Evard",
		originalName: "Evard's Black Tentacles",
		castedBy: [
			"wizard"
		],
		id: "3df52ee2-92e4-4f6b-af91-2815f674265f",
		level: 4,
		school: "conjuration",
		isRitual: false,
		castingTime: "1 action",
		range: "27 mètres",
		components: "V, S, M (un morceau de tentacule d'une pieuvre ou d'un calmar géant)",
		duration: "concentration, jusqu'à 1 minute",
		description: "De sombres tentacules grouillants occupent le sol dans un carré de 6 mètres d'arête que vous pouvez voir dans la portée du sort. Pour la durée du sort, ces tentacules rendent le terrain difficile.<br>Lorsqu'une créature pénètre dans la zone affectée pour la première fois lors d'un tour ou lorsqu'elle y débute son tour, elle doit réussir un jet de sauvegarde de Dextérité ou subir 3d6 dégâts contondants et être entravée par les tentacules jusqu'à la fin du sort. Une créature qui débute son tour dans la zone et qui est déjà entravée par les tentacules subit 3d6 dégâts contondants.<br>Une créature entravée par les tentacules peut utiliser son action pour faire un jet de Force ou de Dextérité (selon son choix) contre le DD de sauvegarde de votre sort. En cas de réussite, elle se libère.<br>"
	},
	{
		name: "Transfert de vie",
		originalName: "Life Transference",
		castedBy: [
			"wizard"
		],
		id: "28bc03db-2ed2-4ea0-815e-e8731fa20936",
		level: 3,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 action",
		range: "9 mètres",
		components: "V, S",
		duration: "instantanée",
		description: "Vous sacrifiez une partie de votre santé pour soigner les blessures d'une autre créature. Vous subissez 4d8 dégâts nécrotiques, qui ne peuvent être diminués d'aucune manière [E], et une créature de votre choix que vous pouvez voir à portée récupère un nombre de points de vie égal à deux fois les dégâts nécrotiques que vous avez perdus.",
		higherLevel: "Lorsque vous lancez ce sort en utilisant un emplacement de sort de niveau 4 ou supérieur, les dégâts augmentent de 1d8 pour chaque niveau d'emplacement au-delà du niveau 3.<br>"
	},
	{
		name: "Transformation de Tenser",
		originalName: "Tenser's Transformation",
		castedBy: [
			"wizard"
		],
		id: "471df8c6-66b0-43ae-8b22-4b31b2eb95ad",
		level: 6,
		school: "transmutation",
		isRitual: false,
		castingTime: "1 action",
		range: "personnelle",
		components: "V, S, M (quelques poils de taureau)",
		duration: "concentration, jusqu'à 10 minutes",
		description: "La lanceur gagne 50 pv, l'avantage aux jets d'attaque, 2d12 extra de dégâts de force, des maîtrises martiales et deux attaques."
	},
	{
		name: "Urne magique",
		originalName: "Magic Jar Possession",
		castedBy: [
			"wizard"
		],
		id: "fbb47984-5542-45f7-b9f3-7c2bc5ea5861",
		level: 6,
		school: "necromancy",
		isRitual: false,
		castingTime: "1 minute",
		range: "personnelle",
		components: "V, S, M (une gemme, du cristal, un reliquaire et un quelconque récipient ornemental valant au moins 500 po)",
		duration: "jusqu'à dissipation",
		description: "Votre corps sombre dans un état catatonique alors que votre âme le quitte pour se loger dans le récipient employé en tant que composante matérielle. Tant que votre âme demeure dans le récipient, vous êtes conscient de votre environnement comme si vous étiez à la place du récipient. Vous ne pouvez vous déplacer ou réagir. La seule action dont vous disposez est de projeter votre âme jusqu'à 30 mètres hors du récipient, soit pour retourner dans votre corps (et mettre fin au sort), soit pour tenter de posséder le corps d'un humanoïde.<br>Vous pouvez tenter de posséder un humanoïde visible à 30 mètres ou moins de vous. Les créatures protégées par un sort de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=protection-contre-le-Mal-et-le-Bien\">protection contre le mal et le bien</a></em> ou un sort de <em><a href=\"https://www.aidedd.org/dnd/sorts.php?vf=cercle-magique\">cercle magique</a></em> ne peuvent être possédées. La cible doit réussir un jet de sauvegarde de Charisme, sans quoi votre âme prend place dans le corps de la cible et l'âme de la cible est séquestrée dans le récipient. En cas de réussite, la cible résiste à votre effort de la posséder, et vous ne pouvez pas tenter de la posséder à nouveau pour les 24 prochaines heures.<br>Lorsque vous prenez possession du corps d'une créature, vous le contrôlez. Vos caractéristiques sont remplacées par celle de la créature. Vous conservez néanmoins votre alignement et votre Intelligence, votre Sagesse et votre Charisme. Vous conservez aussi les bénéfices de vos capacités de classe. Si la cible est dotée de niveaux de classe, vous ne pouvez pas faire usage de ses caractéristiques.<br>Entre temps, l'âme de la créature possédée peut percevoir à partir du récipient avec ses propres sens, mais elle ne peut se déplacer ni prendre action.<br>Pendant que vous possédez un corps, vous pouvez utiliser votre action pour que votre âme retourne dans le récipient s'il se trouve à 30 mètres ou moins de vous. Ainsi, l'âme de la créature d'accueil retourne dans son corps. Si le corps d'accueil meurt pendant que vous y êtes, la créature meurt et vous devez réussir un jet de sauvegarde de Charisme contre le DD de sauvegarde de votre sort. Si vous réussissez et que le récipient est à 30 mètres ou moins de vous, vous réintégrez le récipient. Sinon, vous mourrez.<br>Si le récipient est détruit ou si le sort prend fin, votre âme retourne immédiatement dans votre corps. Si votre corps est à plus de 30 mètres de vous ou si votre corps est mort lorsque vous tentez d'y retourner, vous mourrez. Si l'âme d'une autre créature est dans le récipient au moment où il est détruit, l'âme de la créature retourne à son corps s'il est toujours vivant et à 30 mètres ou moins. Sinon, la créature meurt.<br>Lorsque le sort prend fin, le récipient se détruit.<br>"
	}
];

const db = new DB__default["default"]({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  }
});
async function store(userId, data) {
  return db.putItem({
    TableName: "dnd-telegram-bot-user-data",
    Item: {
      userId: {
        S: String(userId)
      },
      data: {
        S: JSON.stringify(data)
      }
    }
  }).promise();
}
async function retreive(userId) {
  return db.getItem({
    TableName: "dnd-telegram-bot-user-data",
    Key: {
      userId: {
        S: String(userId)
      }
    }
  }).promise().then(data => JSON.parse(data.$response.data?.Item?.data?.S ?? "{}"));
}
async function update(userId, map) {
  let data = await retreive(userId);
  data = map(data);
  await store(userId, data);
}

const schools = {
  abjuration: "Abjuration",
  conjuration: "Invocation",
  divination: "Divination",
  enchantment: "Enchantement",
  evocation: "Évocation",
  illusion: "Illusion",
  necromancy: "Nécromancie",
  transmutation: "Transmutation"
};
const searchSpellCommand = async (params, message) => {
  if (!params) {
    return {
      text: "Pour chercher un sort, ajouter le nom du sort à la commande. Si le nom est exact, vous aurez sa description"
    };
  }

  let result = [];
  let page = 0;
  let spellsPerPage = 10;

  if (params.includes("page:")) {
    let [, parsedPage = "1"] = /page:([a-z-0-9]*)/.exec(params) ?? [];
    page = parseInt(parsedPage) || page;
    params = params.replace(`page:${parsedPage}`, "").trim();
  }

  if (params.includes("id:")) {
    const [, id] = /id:([a-z-0-9]*)/.exec(params) ?? [];
    result = spells.filter(s => s.id == id);
  } else {
    result = searchSpellByName(params);
  }

  if (result.length > 1) {
    let currentPage = page * spellsPerPage;
    let nextPage = (page + 1) * spellsPerPage;
    let paginatedResult = result.slice(currentPage, nextPage);
    let pageButtons = [];
    let buttons = paginatedResult.map(r => ({
      text: r.name,
      callback_data: `/s id:${r.id}`
    }));

    if (currentPage > 0) {
      pageButtons.push({
        text: `< Page ${page}`,
        callback_data: `/s ${params} page:${page - 1}`
      });
    }

    if (nextPage <= result.length) {
      pageButtons.push({
        text: `Page ${page + 2} >`,
        callback_data: `/s ${params} page:${page + 1}`
      });
    }

    return {
      text: `Résultat de la recherche pour : *${params}*${result.length > spellsPerPage ? `\nPage ${page + 1}/${Math.ceil(result.length / spellsPerPage)}` : ""}`,
      params: {
        reply_markup: {
          inline_keyboard: [...buttons.map(b => [b]), pageButtons]
        }
      }
    };
  } else if (result.length > 0) {
    const [spell] = result;
    let resultText = `
*${spell.name} (${spell.isRitual ? "Rituel de " : ""}${schools[spell.school]})*
Sort de niveau ${spell.level}

*Durée d'incantation :* ${spell.castingTime}
*Portée :* ${spell.range}
*Durée :* ${spell.duration}
*Composantes :* ${spell.components}

${spell.description.replace(/<br>/g, "\n\n")}
${spell.higherLevel != undefined ? `

*Au niveau supérieur :*
${spell.higherLevel.replace(/<br>/g, "\n\n")}
` : ""}`.trim();
    let {
      spells = []
    } = await retreive(message.chat.id);

    if (spells.some(s => s.id == spell.id)) {
      return {
        text: resultText,
        params: createButtonGrid([[{
          label: "Retirer du grimoire",
          command: `/grimoire remove id:${spell.id}`
        }, {
          label: "Utiliser le sort",
          command: `/grimoire use id:${spell.id}`
        }], [{
          label: "Voir votre grimoire",
          command: "/grimoire"
        }]])
      };
    } else {
      return {
        text: resultText,
        params: createButtonHorizontalList([{
          label: "Ajouter au grimoire",
          command: `/grimoire add id:${spell.id}`
        }])
      };
    }
  } else {
    return {
      text: `Aucun sort n'a été trouvé pour *${params}*`
    };
  }
};
function searchSpellByName(name) {
  const fullRegexString = name.split(" ").map(s => s.trim()).map(fuzzySearchRegexTemplate).join("");
  const regex = new RegExp(fullRegexString, "i");
  console.log("regex", regex);
  return spells.filter(s => (s.name?.match(regex) ?? []).length > 0) ?? [];
}

const grimoireCommand = async (params, message) => {
  if (message.chat.type != "private") {
    return {
      text: "Cette commande ne peut être utilisée qu'en conversation directe avec le bot."
    };
  }

  const [command = "", ...args] = params?.split(" ") ?? [];

  if (command == "add" && args[0]) {
    return addToGrimoireCommand(params, message);
  } else if (command == "remove" && args[0]) {
    return removeFromGrimoireCommand(params, message);
  } else if (command == "use" && args[0]) {
    return useSpellCommand(params, message);
  } else if (command == "rest") {
    return restCommand(params, message);
  } else {
    return listGrimoireCommand(params, message);
  }
};

const addToGrimoireCommand = async (params, message) => {
  invariant__default["default"](message.from);
  const [command = "", ...args] = params?.split(" ") ?? [];
  let foundSpells = getSpellFromParams(args.join(" "));

  if (foundSpells.length > 1) {
    return {
      text: `${foundSpells.length} sorts trouvés.`,
      params: createButtonVerticalList(foundSpells.map(s => ({
        label: s.name,
        command: `/grimoire add id:${s.id}`
      })))
    };
  } else if (foundSpells.length < 1) {
    return {
      text: `Aucun sort n'a été trouvé pour *${args.join(" ")}*`
    };
  }

  let spell = foundSpells[0];
  let data = await retreive(message.from.id);
  data = { ...data,
    spells: [...(data.spells ?? []), {
      id: spell.id,
      name: spell.name,
      usage: 0
    }]
  };
  await store(message.from.id, data);
  return {
    text: `Le sort *${spell.name}* à été ajouté à votre grimoire`,
    params: createButtonHorizontalList([{
      label: "Voir votre grimoire",
      command: "/grimoire"
    }])
  };
};

const removeFromGrimoireCommand = async (params, message) => {
  invariant__default["default"](message.from);
  const [command = "", ...args] = params?.split(" ") ?? [];

  if (args[0] == "all") {
    await update(message.from.id, data => ({ ...data,
      spells: []
    }));
    return {
      text: `Tous les sorts ont été supprimés de votre grimoire`,
      params: createButtonHorizontalList([{
        label: "Voir votre grimoire",
        command: "/grimoire"
      }])
    };
  }

  let foundSpells = getSpellFromParams(args.join(" "));

  if (foundSpells.length > 1) {
    return {
      text: `${foundSpells.length} sorts trouvés.`,
      params: createButtonVerticalList(foundSpells.map(s => ({
        label: s.name,
        command: `/grimoire remove id:${s.id}`
      })))
    };
  } else if (foundSpells.length < 1) {
    return {
      text: `Aucun sort n'a été trouvé pour *${args.join(" ")}*`
    };
  }

  let spell = foundSpells[0];
  let data = await retreive(message.from.id);
  data = { ...data,
    spells: data.spells?.filter(spell => spell.id != spell.id) ?? []
  };
  await store(message.from.id, data);
  return {
    text: `Le sort *${spell.name}* à été supprimé de votre grimoire`,
    params: createButtonHorizontalList([{
      label: "Voir votre grimoire",
      command: "/grimoire"
    }])
  };
};

const listGrimoireCommand = async (params, message) => {
  invariant__default["default"](message.from);
  const data = await retreive(message.from.id);
  const spells = data.spells;

  if (spells.length == 0) {
    return {
      text: "Votre grimoire est vide"
    };
  }

  return {
    text: `Votre grimoire :`,
    params: createButtonGrid([...spells.map(spell => [{
      label: `${spell.name} (${spell.usage})`,
      command: `/spell id:${spell.id}`
    }, {
      label: "Utiliser",
      command: `/grimoire use id:${spell.id}`
    }]), [{
      label: "Réinitialiser votre grimoire",
      command: "/grimoire rest"
    }, {
      label: "Supprimer tous les sorts",
      command: "/grimoire remove all"
    }]])
  };
};

const useSpellCommand = async (params, message) => {
  invariant__default["default"](message.from);
  const [command = "", ...args] = params?.split(" ") ?? [];
  let foundSpells = getSpellFromParams(args.join(" "));

  if (foundSpells.length > 1) {
    return {
      text: `${foundSpells.length} sorts trouvés.`,
      params: createButtonVerticalList(foundSpells.map(s => ({
        label: s.name,
        command: `/grimoire use id:${s.id}`
      })))
    };
  } else if (foundSpells.length < 1) {
    return {
      text: `Aucun sort n'a été trouvé pour *${args.join(" ")}*`
    };
  }

  let spell = foundSpells[0];
  let data = await retreive(message.from.id);
  let previousUsage = data.spells?.find(s => s.id == spell.id)?.usage ?? 0;
  data = { ...data,
    spells: data.spells?.map(spell => {
      if (spell.id == spell.id) {
        spell.usage++;
      }

      return spell;
    }) ?? []
  };
  await store(message.from.id, data);
  return {
    text: `Le sort *${spell.name}* à été utilisé ${previousUsage + 1} fois`,
    params: createButtonHorizontalList([{
      label: "Voir votre grimoire",
      command: "/grimoire"
    }])
  };
};

const restCommand = async (params, message) => {
  invariant__default["default"](message.from);
  let data = await retreive(message.from.id);
  data = { ...data,
    spells: data.spells?.map(spell => ({ ...spell,
      usage: 0
    })) ?? []
  };
  await store(message.from.id, data);
  return {
    text: `Votre grimoire a été réinitialisé`,
    params: createButtonHorizontalList([{
      label: "Voir votre grimoire",
      command: "/grimoire"
    }])
  };
};

function getSpellFromParams(params) {
  if (params.includes("id:")) {
    const [, id] = /id:([a-z-0-9]*)/.exec(params) ?? [];
    const foundSpell = spells.find(spell => spell.id == id);
    return foundSpell ? [foundSpell] : [];
  } else {
    return searchSpellByName(params);
  }
}

const webAppCommand = async (params, message) => {
  invariant__default["default"](message.from);
  const data = await retreive(message.from.id);
  const spells = data.spells;
  const searchParams = new URLSearchParams();
  searchParams.append("data", JSON.stringify(spells));
  return {
    text: "Appuyez sur le bouton pour ouvrir votre grimoire++",
    params: {
      reply_markup: {
        keyboard: [[{
          text: "Open web app",
          web_app: {
            url: `https://dnd-telegram-bot.netlify.app/?${searchParams.toString()}`
          }
        }]]
      }
    }
  };
};

const commands = {
  chaos: chaosCommand,
  c: chaosCommand,
  roll: rollCommand,
  r: rollCommand,
  spell: searchSpellCommand,
  s: searchSpellCommand,
  grimoire: grimoireCommand,
  webapp: webAppCommand
};

const token = process.env.TELEGRAM_TOKEN;
const sendToUser = async ({
  chat_id,
  text,
  ...params
}) => {
  return post({
    chat_id,
    text,
    ...params
  });
};

async function post(data) {
  return new Promise((resolve, reject) => {
    const options = {
      host: "api.telegram.org",
      path: `/bot${token}/sendMessage`,
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    };
    console.log(data); //create the request object with the callback with the result

    const req = https__default["default"].request(options, res => {
      res.on("data", function (chunk) {
        console.log("BODY: " + chunk);
        resolve(JSON.parse(chunk));
      });
    }); // handle the possible errors

    req.on("error", e => {
      reject(e.message);
    }); //do the request

    req.write(JSON.stringify({ ...data,
      parse_mode: "Markdown"
    })); //finish the request

    req.end();
  });
}

const commandParseRegex = /\/(\w+)\s?(.+)?/;
async function app(body) {
  console.log("body", body);

  if ("callback_query" in body) {
    if (body.callback_query?.message && "text" in body.callback_query.message) {
      return executeCommand({ ...body.callback_query.message,
        text: body.callback_query.data ?? "",
        from: body.callback_query.from
      });
    }
  } else if ("text" in body.message) {
    return executeCommand(body.message);
  }
}

async function executeCommand(message) {
  const respond = ({
    text = "",
    params = {}
  }) => sendToUser({
    chat_id: message.chat.id,
    text,
    ...params
  });

  let [command, params] = parseCommand(message.text) ?? [];

  if (command in commands) {
    return respond(await commands[command](params, message));
  } else {
    if (message.chat.type == "private") {
      return respond({
        text: "J'avoue que j'ai rien compris là... Recommence ?"
      });
    }
  }
}

function parseCommand(message) {
  console.log("parsing command", message);
  let parsed = commandParseRegex.exec(message);

  if (parsed != null) {
    let [, command, params] = parsed;
    console.log("parsed", command, params);
    return [command, params];
  } else {
    return null;
  }
}

const handler = async (event, context) => {
  console.log("event", event);

  switch (event.rawPath) {
    case "/default/DnDTelegramBot":
      try {
        await app(JSON.parse(event.body ?? "{}"));
        return {
          statusCode: 200,
          body: JSON.stringify(event)
        };
      } catch (e) {
        console.error(e);
        return {
          statusCode: 200,
          body: JSON.stringify(e)
        };
      }

    case "/default/get-spells":
      var userId = event.queryStringParameters?.["user-id"];
      invariant__default["default"](userId, "userId is required");
      return {
        statusCode: 200,
        body: JSON.stringify(await retreive(userId))
      };

    case "/default/save-spells":
      var userId = event.queryStringParameters?.["user-id"];
      invariant__default["default"](userId, "userId is required");
      var data = JSON.parse(event.body ?? "{}");
      invariant__default["default"](data, "data is required");
      await store(userId, data);
      return {
        statusCode: 200,
        body: ""
      };

    default:
      return {
        statusCode: 404,
        body: ""
      };
  }
};

exports.handler = handler;
