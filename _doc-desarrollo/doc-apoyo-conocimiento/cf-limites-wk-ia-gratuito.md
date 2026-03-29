Sí: **Workers AI también tiene capa gratuita**.

Lo confirmado en la documentación oficial de Cloudflare es esto:

* **Workers AI está incluido tanto en Workers Free como en Workers Paid**. ([Cloudflare Docs][1])
* La **asignación gratuita** es de **10.000 Neurons por día**, sin cargo. ([Cloudflare Docs][1])
* Si superas esos **10.000 Neurons/día**, necesitas el **Workers Paid plan** para seguir usando más capacidad. ([Cloudflare Docs][1])
* El precio publicado para el exceso es **USD 0,011 por cada 1.000 Neurons**. ([Cloudflare Docs][1])

### Qué significa en la práctica

Workers AI **no se mide en “requests gratis al día” como Workers clásico**, sino principalmente en **Neurons**, que es la unidad de consumo que Cloudflare usa para inferencias de IA. Cloudflare además indica que el precio visible por modelo puede mostrarse por unidades más concretas, pero la facturación de fondo sigue haciéndose en **Neurons**. ([Cloudflare Docs][1])

### Importante sobre límites

Además del precio, Cloudflare tiene una página separada de **límites/rate limits** para Workers AI. Esa página confirma que existen límites operativos y que algunos modelos beta pueden tener límites menores, pero el resultado que pude verificar aquí no muestra en el extracto los números exactos de cada límite. ([Cloudflare Docs][2])

### Resumen corto

* **Free tier de Workers AI**: **10.000 Neurons/día**
* **Exceso**: **USD 0,011 / 1.000 Neurons**
* **Requiere plan Paid** para usar más allá del cupo gratuito diario ([Cloudflare Docs][1])

No he encontrado en las fuentes abiertas verificadas un equivalente simple tipo “X segundos gratis de ejecución” para Workers AI, porque su cobro principal no se expresa por tiempo de ejecución sino por **consumo del modelo**. ([Cloudflare Docs][1])

## Fuentes

1. **Pricing · Cloudflare Workers AI docs** — Cloudflare
   URL: [https://developers.cloudflare.com/workers-ai/platform/pricing/](https://developers.cloudflare.com/workers-ai/platform/pricing/)
   Fecha visible: 19 mar 2026. ([Cloudflare Docs][1])

2. **Pricing · Cloudflare Workers docs** — Cloudflare
   URL: [https://developers.cloudflare.com/workers/platform/pricing/](https://developers.cloudflare.com/workers/platform/pricing/)
   Fecha visible: 20 mar 2026. ([Cloudflare Docs][3])

3. **Limits · Cloudflare Workers AI docs** — Cloudflare
   URL: [https://developers.cloudflare.com/workers-ai/platform/limits/](https://developers.cloudflare.com/workers-ai/platform/limits/)
   Fecha visible: 20 ago 2025. ([Cloudflare Docs][2])

4. **Workers AI updated pricing · Changelog** — Cloudflare
   URL: [https://developers.cloudflare.com/changelog/post/2025-02-20-updated-pricing-docs/](https://developers.cloudflare.com/changelog/post/2025-02-20-updated-pricing-docs/)
   Fecha: 20 feb 2025. ([Cloudflare Docs][4])

Si te sirve, te hago una **tabla única** con **Workers, Workflows, Workers AI, KV, D1, Queues y R2**, separando **gratis / pago / unidad de cobro**.

[1]: https://developers.cloudflare.com/workers-ai/platform/pricing/?utm_source=chatgpt.com "Pricing · Cloudflare Workers AI docs"
[2]: https://developers.cloudflare.com/workers-ai/platform/limits/?utm_source=chatgpt.com "Limits · Cloudflare Workers AI docs"
[3]: https://developers.cloudflare.com/workers/platform/pricing/?utm_source=chatgpt.com "Pricing · Cloudflare Workers docs"
[4]: https://developers.cloudflare.com/changelog/post/2025-02-20-updated-pricing-docs/?utm_source=chatgpt.com "Workers AI updated pricing · Changelog"
