import type { Strings } from "./strings";

/**
 * Argentinian Spanish (rioplatense) — voseo, Buenos Aires references.
 * This is the default locale and is hardcoded at boot.
 */
const es: Strings = {
  app: {
    name: "al pasto.",
    tagline: "El juego de cartas extraoficial",
  },
  home: {
    intro:
      "Multijugador. Sin cuentas. Nada sale del cuarto. El anfitrión corre la partida desde su propio celular — cerraste la pestaña, se terminó.",
    name: "Tu nombre",
    namePool: [
      "Mati",
      "Naza",
      "Juli",
      "Fran",
      "Pato",
      "Tincho",
      "Caro",
      "Agus",
      "Lu",
      "Rocho",
    ],
    roomCode: "Código de sala",
    join: "Entrar",
    host: "Crear sala",
    createCta: "Crear sala",
    joinCta: "Entrar a una sala",
    back: "Volver",
    connecting: "Conectando…",
  },
  mode: {
    title: "Modo de juego",
    classic: "Clásico",
    classicDesc:
      "El original. Consignas del mazo y cartas blancas repartidas en tu mano.",
    custom: "Personalizado",
    customDesc:
      "Los jugadores escriben sus respuestas. Elegí de dónde salen las consignas.",
    presetTitle: "Configuración personalizada",
    blank: "Cartas blancas en blanco",
    blankDesc: "Escribí tus respuestas; las consignas salen del mazo.",
    customBlack: "Consignas propias",
    customBlackDesc: "Escribí también tus propias consignas.",
    mix: "Mezclar todo",
    mixDesc: "Tus consignas mezcladas con las del mazo.",
    authoringTitle: "¿Quién escribe las consignas?",
    authoringHost: "Las escribe el anfitrión",
    authoringPlayers: "Las escriben todos",
    deckSize: "Tamaño del mazo de consignas",
    countryTitle: "País",
    countryAll: "Todos los países",
    countryChange: "Quiero jugar con el mazo de otro país",
    continue: "Continuar",
  },
  authoring: {
    header: "Escribí tus consignas",
    hint: (n) => (n === 1 ? "Escribí 1 consigna." : `Escribí ${n} consignas.`),
    placeholder: (n) => `Consigna ${n}`,
    submit: "Enviar consignas",
    waitingTitle: "Están llegando las consignas.",
    waiting: "Esperando a que todos terminen de escribir…",
    progress: (a, b) => `${a} de ${b} listos`,
  },
  lobby: {
    room: "Sala",
    shareToInvite: "Compartí para invitar",
    settings: "Ajustes",
    scoreToWin: "Puntos para ganar",
    roundTimer: "Tiempo por ronda",
    judgeTimer: "Tiempo para juzgar",
    timerOff: "Sin límite",
    noTime: "Sin límite",
    judgeMode: "Quién juzga",
    judgeRotate: "Juez rotativo",
    judgeEverybody: "Votan todos",
    secondsSuffix: (n) => `${n}s`,
    minutesSuffix: (n) => `${n} min`,
    clockSuffix: (m, s) => `${m}:${String(s).padStart(2, "0")}`,
    players: (n) => `Jugadores (${n})`,
    needMore: (n) => (n === 1 ? "Falta 1" : `Faltan ${n}`),
    hostBadge: "anfitrión",
    youBadge: "vos",
    reconnecting: "reconectando…",
    kick: "Echar",
    start: "Empezar la partida",
    waiting: "Esperando al anfitrión…",
    gameMode: "Modo",
    modeClassic: "Clásico",
    modeCustom: "Personalizado",
    prompts: "Consignas",
    promptPlaceholder: (n) => `Consigna ${n}`,
    addPrompt: "Agregar consigna",
    promptsNeeded: (n) =>
      n === 1
        ? "Escribí al menos 1 consigna"
        : `Escribí al menos ${n} consignas`,
    customNotice:
      "Los jugadores van a escribir las consignas antes de empezar.",
    localePrompt: (label) =>
      `Esta sala está en ${label}. ¿Cambiamos el idioma de la interfaz?`,
    localeSwitch: "Cambiar",
    localeKeep: "Mantener",
  },
  player: {
    judgeBanner: "Sos el juez",
    judgeWait: "Esperá a que la sala juegue sus cartas.",
    round: (n) => `Ronda ${n}`,
    picks: (n) => (n === 1 ? "1 elección" : `${n} elecciones`),
    playZone: "Zona de juego",
    dragHere: (n) =>
      n === 1
        ? "Tocá una carta para jugarla."
        : `Tocá ${n} cartas para jugarlas.`,
    tapToPlay: (n) => (n === 1 ? "Tocá una carta" : `Tocá ${n} cartas`),
    submit: "Jugar",
    submitProgress: (a, b) => `${a}/${b}`,
    yourHand: "Tus cartas",
    cardCount: (n) => (n === 1 ? "1 carta" : `${n} cartas`),
    waitingTitle: "Están cayendo las cartas.",
    submittedWaiting: "Jugaste. Esperando al resto…",
    playersProgress: (a, b) => `${a} de ${b} jugadores`,
    cardsProgress: (a, b) => `${a}/${b} cartas`,
    yourAnswer: "Tu respuesta",
    answerPlaceholder: (n) => `Respuesta ${n}`,
    writeAnswer: (n) =>
      n === 1 ? "Escribí tu respuesta" : `Escribí ${n} respuestas`,
  },
  judge: {
    youAreJudge: "Sos el juez",
    judgingHeader: "Juzgando",
    waiting: "El juez está eligiendo. Bancá un toque.",
    round: (n) => `Ronda ${n}`,
    cardOrdinal: (n) => `Carta ${n}`,
    tapToPick: "TOCÁ PARA ELEGIR",
    tapAgainToConfirm: "Tocá de nuevo la carta dada vuelta para confirmar",
    tapACardToReveal: "Tocá una carta para revelar",
    voteHeader: "Votá la mejor",
    tapToVote: "TOCÁ PARA VOTAR",
    tapACardToVote: "Tocá una carta para revelar, tocá de nuevo para votar",
    votedWaiting: "Voto registrado. Esperando al resto…",
    votesProgress: (a, b) => `${a} de ${b} votos`,
  },
  reveal: {
    badge: "Ronda ganada",
    takesRound: (name) => `Esta ronda se la lleva ${name}.`,
    winnerTag: "GANÓ",
    pointPlus: "+1 punto",
    nextRound: "Próxima ronda",
    waitingHost: "Esperando al anfitrión…",
  },
  winner: {
    gameOver: "Fin de la partida",
    wins: (name) => `Ganó ${name}.`,
    back: "Volver al inicio",
  },
  errors: {
    roomNotFound: "La sala no existe.",
    handlerFailed: (m) => `Falló el handler: ${m}`,
    terminatedQuorum:
      "Quedaron menos de tres jugadores. Se terminó la partida.",
    terminatedHostGone:
      "El anfitrión se fue y no se pudo reasignar. Volvé al inicio.",
  },
  landing: {
    metaTitle: "Al pasto — juego de cartas online gratis para jugar con amigos",
    metaDescription:
      "Juego de cartas multijugador estilo Cartas contra la Humanidad, en español rioplatense. Gratis, sin cuentas y sin descargas: creá una sala, compartí el QR y jugá desde el celular.",
    kicker: "Multijugador · Gratis · Sin cuentas",
    heroTitle: "El juego de cartas extraoficial",
    heroSubtitle:
      "Una consigna, un juez y las peores respuestas de tus amigos. Nada sale del cuarto: el anfitrión corre la partida desde su propio celular.",
    heroCard: "Lo que jamás dirías en el grupo familiar de WhatsApp: _.",
    heroCardMeta: "1 elección",
    heroAnswer: "Una llamada del Banco a las 3 de la mañana.",
    playCta: "Crear sala",
    rulesCta: "¿Cómo se juega?",
    howTitle: "Así de simple",
    steps: [
      {
        title: "Creá la sala",
        body: "Entrá desde el navegador, poné tu nombre y elegí el modo. Sin registro y sin instalar nada.",
      },
      {
        title: "Compartí el QR",
        body: "Tus amigos escanean el código o entran con el código de sala. Cada uno juega desde su celular.",
      },
      {
        title: "Jugá",
        body: "En cada ronda hay una consigna y un juez. La respuesta más desubicada se lleva el punto.",
      },
    ],
    featuresTitle: "Por qué Al pasto",
    features: [
      {
        title: "Gratis y open source",
        body: "Sin publicidad y sin suscripciones. El código es libre (AGPL) y está en GitHub.",
      },
      {
        title: "Sin base de datos",
        body: "No hay servidor que guarde nada: la partida vive en el celular del anfitrión. Cerraste la pestaña, se terminó.",
      },
      {
        title: "Anonimato real",
        body: "El juez ve las respuestas mezcladas y sin nombres. Nadie sabe quién mandó qué hasta que se revela la ganadora.",
      },
      {
        title: "Cartas propias",
        body: "Modo personalizado: escribí tus respuestas y hasta tus propias consignas. El mazo lo arma el grupo.",
      },
    ],
    footerRules: "Reglas del juego",
    footerGithub: "Código en GitHub",
  },
  rules: {
    metaTitle: "Cómo se juega Al pasto — reglas del juego de cartas",
    metaDescription:
      "Reglas de Al pasto: qué necesitás, cómo se arma una sala, cómo funciona cada ronda, el juez, los puntos y el modo personalizado. Explicado en dos minutos.",
    title: "¿Cómo se juega?",
    intro:
      "Al pasto es un juego de cartas para reírse de lo que no se dice en voz alta, inspirado en Cards Against Humanity. Una consigna, un juez y las respuestas de tus amigos compitiendo por el punto.",
    sections: [
      {
        title: "Lo que necesitás",
        body: [
          "Tres jugadores o más, cada uno con su celular.",
          "Uno crea la sala y comparte el QR o el código de sala. Ese celular es el anfitrión: la partida corre ahí, no en un servidor.",
          "No hace falta cuenta ni descargar nada: se juega desde el navegador.",
        ],
      },
      {
        title: "Cada ronda",
        body: [
          "Aparece una carta negra con una consigna y uno o dos espacios en blanco.",
          "Todos menos el juez eligen la carta blanca de su mano que mejor (o peor) complete la frase. En algunos modos escribís tu respuesta a mano.",
          "El juez recibe las respuestas mezcladas y anónimas: nadie sabe quién mandó qué.",
          "El juez elige la ganadora. Ese jugador se lleva el punto y recién ahí se revela quién era.",
        ],
      },
      {
        title: "Puntos y final",
        body: [
          "El rol de juez rota cada ronda, o votan todos si la sala se configura así.",
          "Gana la partida el primero que llega al puntaje elegido en los ajustes de la sala.",
          "Se puede poner un tiempo límite por ronda para que nadie se cuelgue.",
        ],
      },
      {
        title: "Modo personalizado",
        body: [
          "Cartas en blanco: en lugar de jugar cartas de tu mano, escribís tu respuesta en cada ronda.",
          "Consignas propias: el grupo escribe las cartas negras antes de empezar, o las mezcla con el mazo original.",
          "Ideal para chistes internos: el mazo lo arma el grupo y muere con la partida.",
        ],
      },
      {
        title: "Privacidad",
        body: [
          "No hay base de datos ni cuentas: nada de lo que se juega queda guardado en un servidor.",
          "Si el anfitrión se cae, otro jugador toma la posta automáticamente. Si quedan menos de tres, la partida se termina sola.",
        ],
      },
    ],
    faqTitle: "Preguntas frecuentes",
    faq: [
      {
        q: "¿Es gratis?",
        a: "Sí, completamente. Sin publicidad ni compras. El código es open source (AGPL) y está en GitHub.",
      },
      {
        q: "¿Necesito crear una cuenta o descargar una app?",
        a: "No. Se juega desde el navegador del celular. Si querés, podés agregarla a tu pantalla de inicio como una app.",
      },
      {
        q: "¿Cuántos jugadores hacen falta?",
        a: "Mínimo tres, cada uno con su dispositivo. Si quedan menos de tres, la partida se termina sola.",
      },
      {
        q: "¿Dónde se guardan las partidas?",
        a: "En ningún lado. La partida vive en el celular del anfitrión y desaparece cuando se cierra la pestaña.",
      },
      {
        q: "¿Puedo escribir mis propias cartas?",
        a: "Sí. El modo personalizado deja escribir tus respuestas y también tus propias consignas.",
      },
      {
        q: "¿Está en otros idiomas?",
        a: "Por ahora en español rioplatense y en inglés, cada uno con su propio mazo de cartas.",
      },
    ],
    playCta: "Jugar ahora",
    landingLink: "Conocé más del juego",
    otherLang: "Read the rules in English",
  },
};

export default es;
