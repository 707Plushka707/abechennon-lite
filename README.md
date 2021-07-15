Abechenoon TraderBot

Que es Abechennon?
Es un bot de trading para el exchange Binance, en desarrollo con node js. Abechennon opera a traves del comercio de margin, por lo tanto puede hacer uso del apalancaminto que ofrece Binance y operar tanto en operaciones en largos o cortos (long/short).

Se puede usar?
Claro, actualmente el desarrollo del back-end ya se encuentra avanzado y con las caracteristicas minimas requeridas, por lo cual puede lanzarlo a traves de la terminal/consola para su operacion. Pero unicamente desarrolladores estaran capacitados para su uso ya que el front-end aun no fue desarrollado y la unica manera de cargar la informacion y editar la estrategia sera a traves de la edicion del proyecto en un IDE.

Ruta de desarrollo para el back-end: 
* Agregar profit factor al backtesting
* Agregar herramientas de risk manangement (trailing stop, stop loss, etc)
* Conectar mongo atlas, agregar schemas
* Agregar routes, endpoints
* Concatenacion de ordenes (actualmente funciona como ping-pong, si la senial es buy: entonces cierra el short y abre el long en la misma vela)
* Agregar analisis de herramientas de accion de precios
* Agregar analisis de pool de volumen
* Y muchas otras..
