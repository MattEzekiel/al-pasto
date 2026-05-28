import type { Strings } from "./strings";

/**
 * Argentinian Spanish (rioplatense) — voseo, Buenos Aires references.
 * This is the default locale and is hardcoded at boot.
 */
const es: Strings = {
  app: {
    name: "corta.",
    tagline: "El juego de cartas extraoficial",
  },
  home: {
    intro:
      "Multijugador. Sin cuentas. Nada sale del cuarto. El anfitrión corre la partida desde su propio celular — cerraste la pestaña, se terminó.",
    name: "Tu nombre",
    namePlaceholder: "Mati",
    roomCode: "Código de sala",
    roomPlaceholder: "4F2K",
    join: "Entrar",
    host: "Crear sala",
  },
  lobby: {
    room: "Sala",
    shareToInvite: "Compartí para invitar",
    settings: "Ajustes",
    scoreToWin: "Puntos para ganar",
    roundTimer: "Tiempo por ronda",
    timerOff: "Sin límite",
    secondsSuffix: (n) => `${n}s`,
    players: (n) => `Jugadores (${n})`,
    needMore: (n) => (n === 1 ? "Falta 1" : `Faltan ${n}`),
    hostBadge: "anfitrión",
    youBadge: "vos",
    reconnecting: "reconectando…",
    kick: "Echar",
    start: "Empezar la partida",
    waiting: "Esperando al anfitrión…",
  },
  player: {
    judgeBanner: "Sos el juez",
    judgeWait: "Esperá a que la sala juegue sus cartas.",
    round: (n) => `Ronda ${n}`,
    picks: (n) => (n === 1 ? "1 elección" : `${n} elecciones`),
    playZone: "Zona de juego",
    dragHere: (n) =>
      n === 1 ? "Arrastrá una carta acá." : `Arrastrá ${n} cartas acá.`,
    submit: "Jugar",
    submitProgress: (a, b) => `${a}/${b}`,
    yourHand: "Tus cartas",
    cardCount: (n) => (n === 1 ? "1 carta" : `${n} cartas`),
  },
  judge: {
    youAreJudge: "Sos el juez",
    judgingHeader: "Juzgando",
    waiting: "El juez está eligiendo. Bancá un toque.",
    round: (n) => `Ronda ${n}`,
    tapToPick: "TOCÁ PARA ELEGIR",
    tapAgainToConfirm: "Tocá de nuevo la carta dada vuelta para confirmar",
    tapACardToReveal: "Tocá una carta para revelar",
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
    terminatedQuorum: "Quedaron menos de tres jugadores. Se terminó la partida.",
    terminatedHostGone: "El anfitrión se fue y no se pudo reasignar. Volvé al inicio.",
  },
};

export default es;
