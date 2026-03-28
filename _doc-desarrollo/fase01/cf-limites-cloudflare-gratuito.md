Sí. Tomando **la documentación oficial de Cloudflare vigente en marzo de 2026**, esta es la **capa gratuita** más relevante para **Workers**, **Workflows** y servicios cercanos del ecosistema Workers. ([Cloudflare Docs][1])

## Resumen rápido

### 1) Cloudflare Workers (plan Free)

En **Workers Free**, Cloudflare incluye: **100.000 requests al día**, **sin cobro por duración**, y **10 ms de CPU por invocación**. Además, el límite diario se reinicia a medianoche UTC. ([Cloudflare Docs][1])

Detalles útiles:

* **Tiempo de CPU**: 10 ms por invocación en Free. ([Cloudflare Docs][1])
* **Duración / wall time**: Cloudflare no cobra duración en Workers; para peticiones HTTP no hay un límite duro de wall time mientras el cliente siga conectado. ([Cloudflare Docs][1])
* **CPU en plan de pago**: el límite por defecto en Paid es 30 s y puede ampliarse hasta **5 minutos** configurando `limits.cpu_ms`. ([Cloudflare Docs][2])
* **Memoria**: **128 MB por isolate**. ([Cloudflare Docs][2])
* **Logs**: en Free, **200.000 eventos de log al día** con **3 días de retención**. ([Cloudflare Docs][1])

### 2) Cloudflare Workflows (plan Free)

En la tabla pública de precios de Cloudflare, **Workflows Free** incluye: **100.000 requests al día**, **10 ms de CPU**, y **1 GB de storage**. ([workers.cloudflare.com][3])

En la documentación técnica de límites, Cloudflare detalla además para **Workflows Free**:

* **10 ms de compute time por step**. ([Cloudflare Docs][4])
* **Duración (wall clock) ilimitada por step**. ([Cloudflare Docs][4])
* **100 MB** de estado persistido por instancia. ([Cloudflare Docs][4])
* **1.024 steps por workflow**. ([Cloudflare Docs][4])
* **100.000 ejecuciones al día**, compartidas con el límite diario de Workers. ([Cloudflare Docs][4])
* **100 instancias concurrentes por cuenta**. ([Cloudflare Docs][4])
* **50 subrequests por invocación** en Free, y **1.000 subrequests a servicios de Cloudflare por invocación** en Free. ([Cloudflare Docs][4])

**Importante:** la documentación pública usa dos formulaciones para Workflows Free: la página comercial resume **“10 ms / invocation”**, mientras que la página de límites técnicos indica **“10 ms de compute time por step”**. Para no inventar una interpretación, te lo dejo tal como aparece en ambas fuentes oficiales. ([workers.cloudflare.com][3])

### 3) Otros elementos relacionados del ecosistema Workers

**Workers KV (Free)**

* **100.000 lecturas/día**
* **1.000 escrituras/día**
* **1.000 borrados/día**
* **1.000 list requests/día**
* **1 GB almacenado** ([Cloudflare Docs][5])

**Durable Objects (Free)**

* **100.000 requests/día**
* **13.000 GB-s/día**
* **5 GB de SQL stored data**
* En la tabla comercial también aparecen las tarifas de pago por request, duración y almacenamiento. ([workers.cloudflare.com][3])

**D1 (Free)**

* **5 millones de rows read/día**
* **100.000 rows written/día**
* **5 GB de storage total** ([Cloudflare Docs][6])

**Hyperdrive (Free)**

* **100.000 database queries/día**. Cloudflare aclara que los límites gratuitos se reinician diariamente a las **00:00 UTC**. ([Cloudflare Docs][7])

**Queues (Free)**

* **10.000 operaciones/día** incluidas en Free. Cloudflare explicó en febrero de 2026 que Queues pasó a formar parte del plan Free de Workers. ([Cloudflare Docs][8])

**Browser Rendering (Free)**

* **10 minutos/día**
* **3 navegadores concurrentes** ([workers.cloudflare.com][3])

**R2**
R2 no funciona exactamente como “incluido sin más” dentro del plan Workers Free: requiere su propia suscripción, pero tiene una **free tier** con **10 GB-month de storage**, **1 millón de operaciones Class A/mes**, **10 millones de operaciones Class B/mes** y **egress a Internet gratis** para almacenamiento Standard. ([Cloudflare Docs][9])

## Lo más importante para “tiempo de ejecución”

Si tu foco es solo el **tiempo de ejecución**:

* **Workers Free**: **10 ms de CPU por invocación**. ([Cloudflare Docs][1])
* **Workflows Free**: la documentación muestra **10 ms de CPU** en pricing y **10 ms de compute time por step** en límites técnicos. ([workers.cloudflare.com][3])
* En ambos casos, **CPU time no es lo mismo que wall time**: esperar red, I/O o bases de datos no cuenta como CPU activa. ([Cloudflare Docs][4])

## Recomendación práctica

Para evaluar si te alcanza la capa gratuita:

* Si tu Worker hace respuestas muy rápidas, APIs simples o middleware ligero, **100k requests/día + 10 ms CPU/invocación** suele ser suficiente para pruebas y proyectos pequeños. ([Cloudflare Docs][1])
* Si tu flujo hace orquestación larga, esperas, retries o sleeps, **Workflows** puede encajar bien porque el **wall time por step es ilimitado**, pero el **cómputo activo gratuito sigue siendo muy corto**. ([Cloudflare Docs][4])

## Fuentes

1. **Cloudflare Workers pricing** — Cloudflare
   URL: `https://developers.cloudflare.com/workers/platform/pricing/`
   Última actualización visible: 20 mar 2026. ([Cloudflare Docs][1])

2. **Cloudflare Workers limits** — Cloudflare
   URL: `https://developers.cloudflare.com/workers/platform/limits/`
   Última actualización visible: 20 mar 2026. ([Cloudflare Docs][2])

3. **Cloudflare Workflows pricing** — Cloudflare
   URL: `https://developers.cloudflare.com/workflows/reference/pricing/`
   Última actualización visible: 20 mar 2026. ([Cloudflare Docs][10])

4. **Cloudflare Workflows limits** — Cloudflare
   URL: `https://developers.cloudflare.com/workflows/reference/limits/`
   Última actualización visible: 20 mar 2026. ([Cloudflare Docs][4])

5. **Cloudflare developer pricing page** — Cloudflare
   URL: `https://workers.cloudflare.com/pricing`
   Fecha visible en la captura textual: sin fecha editorial clara en la página mostrada. ([workers.cloudflare.com][3])

6. **Workers KV pricing** — Cloudflare
   URL: `https://developers.cloudflare.com/kv/platform/pricing/`
   Última actualización visible: 6 feb 2026. ([Cloudflare Docs][5])

7. **D1 pricing** — Cloudflare
   URL: `https://developers.cloudflare.com/d1/platform/pricing/`
   Última actualización visible: 23 jul 2025. ([Cloudflare Docs][6])

8. **Hyperdrive pricing** — Cloudflare
   URL: `https://developers.cloudflare.com/hyperdrive/platform/pricing/`
   Última actualización visible: 12 nov 2025. ([Cloudflare Docs][7])

9. **Queues pricing** — Cloudflare
   URL: `https://developers.cloudflare.com/queues/platform/pricing/`
   Última actualización visible: 13 ago 2024. ([Cloudflare Docs][8])

10. **Queues now available on Workers Free plan** — Cloudflare Changelog
    URL: `https://developers.cloudflare.com/changelog/post/2026-02-04-queues-free-plan/`
    Fecha: 4 feb 2026. ([Cloudflare Docs][11])

11. **R2 pricing** — Cloudflare
    URL: `https://developers.cloudflare.com/r2/pricing/`
    Última actualización visible: 30 sept 2025. ([Cloudflare Docs][9])

12. **R2 get started** — Cloudflare
    URL: `https://developers.cloudflare.com/r2/get-started/`
    Última actualización visible: 26 ene 2026. ([Cloudflare Docs][12])

[1]: https://developers.cloudflare.com/workers/platform/pricing/ "https://developers.cloudflare.com/workers/platform/pricing/"
[2]: https://developers.cloudflare.com/workers/platform/limits/ "https://developers.cloudflare.com/workers/platform/limits/"
[3]: https://workers.cloudflare.com/pricing "https://workers.cloudflare.com/pricing"
[4]: https://developers.cloudflare.com/workflows/reference/limits/ "https://developers.cloudflare.com/workflows/reference/limits/"
[5]: https://developers.cloudflare.com/kv/platform/pricing/ "https://developers.cloudflare.com/kv/platform/pricing/"
[6]: https://developers.cloudflare.com/d1/platform/pricing/ "https://developers.cloudflare.com/d1/platform/pricing/"
[7]: https://developers.cloudflare.com/hyperdrive/platform/pricing/ "https://developers.cloudflare.com/hyperdrive/platform/pricing/"
[8]: https://developers.cloudflare.com/queues/platform/pricing/ "https://developers.cloudflare.com/queues/platform/pricing/"
[9]: https://developers.cloudflare.com/r2/pricing/ "https://developers.cloudflare.com/r2/pricing/"
[10]: https://developers.cloudflare.com/workflows/reference/pricing/ "https://developers.cloudflare.com/workflows/reference/pricing/"
[11]: https://developers.cloudflare.com/changelog/post/2026-02-04-queues-free-plan/ "https://developers.cloudflare.com/changelog/post/2026-02-04-queues-free-plan/"
[12]: https://developers.cloudflare.com/r2/get-started/ "https://developers.cloudflare.com/r2/get-started/"

