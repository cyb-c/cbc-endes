Sí: puedes enviar **el JSON prompt casi tal cual** a **`/v1/responses`**, y que el `.ts` solo haga dos cosas:

1. cargar el archivo JSON del prompt,
2. sustituir `%%ijson%%` por el JSON origen,
3. mandar **ese payload** a `client.responses.create(...)`.

Eso encaja con la Responses API: el body acepta `model`, `instructions` e `input`, justo como está en tu archivo. ([OpenAI Desarrolladores][1])

### Ejemplo `.ts` como lo quieres

```ts id="uhsd32"
import OpenAI from "openai";
import fs from "node:fs/promises";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  // JSON del prompt, tal cual está guardado en archivo
  const promptTemplateRaw = await fs.readFile("./00_CrearProyecto.json", "utf8");

  // JSON origen de datos
  const inputJsonRaw = await fs.readFile("./Ejemplo-modelo-info.json", "utf8");

  // Sustituir el placeholder dentro del JSON prompt
  const requestBodyRaw = promptTemplateRaw.replace("%%ijson%%", inputJsonRaw);

  // Parsear UNA sola vez el payload final y enviarlo tal cual
  const requestBody = JSON.parse(requestBodyRaw);

  const response = await client.responses.create(requestBody);

  console.log(response.output_text);
}

main().catch(console.error);
```

### Si quieres ver el equivalente HTTP puro

```bash id="1o7m3e"
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d @request-body.json
```

Donde `request-body.json` sería literalmente el resultado de coger tu `00_CrearProyecto.json` y reemplazar `%%ijson%%` por el JSON del inmueble. El endpoint oficial es `POST /v1/responses`. ([OpenAI Desarrolladores][2])

### Variante todavía más fiel a “encapsular el JSON”

Si quieres que TS no “toque” nada más que el reemplazo:

```ts id="61q1c8"
import OpenAI from "openai";
import fs from "node:fs/promises";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function ejecutarPromptDesdeArchivo(
  promptFile: string,
  dataFile: string
) {
  const template = await fs.readFile(promptFile, "utf8");
  const data = await fs.readFile(dataFile, "utf8");

  const payload = JSON.parse(template.replace("%%ijson%%", data));

  return client.responses.create(payload);
}

const response = await ejecutarPromptDesdeArchivo(
  "./00_CrearProyecto.json",
  "./Ejemplo-modelo-info.json"
);

console.log(response.output_text);
```

### Importante

Esto funciona **si el archivo prompt ya tiene forma válida para Responses API**, como el tuyo:

* `model`
* `instructions`
* `input`

Y el placeholder `%%ijson%%` está dentro de `input[0].content[0].text`, que luego pasa a ser texto de entrada real. El parámetro `instructions` se usa justo para dar las instrucciones de más alta prioridad, separado del `input`. ([OpenAI Desarrolladores][1])

### Consejo práctico

Como tu JSON origen puede contener comillas, saltos de línea y caracteres especiales, el método de `replace` sobre el archivo completo funciona bien **porque estás insertando ese JSON dentro de un string JSON ya escapado solo si el placeholder estaba dentro de una cadena**. En tu plantilla actual, `%%ijson%%` está dentro de `"text": "%%ijson%%"`, así que para que no se rompa el JSON, lo más seguro es sustituir por la versión escapada para JSON string:

```ts id="mz12wu"
const escapedInputJson = JSON.stringify(inputJsonRaw).slice(1, -1);
const requestBodyRaw = promptTemplateRaw.replace("%%ijson%%", escapedInputJson);
```

Y entonces:

```ts id="7zvo8b"
const requestBody = JSON.parse(requestBodyRaw);
const response = await client.responses.create(requestBody);
```

Ese detalle es el importante para que no te explote el parseo cuando metas un JSON real largo.

La versión final que yo usaría sería esta:

```ts id="88eh5t"
import OpenAI from "openai";
import fs from "node:fs/promises";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const promptTemplateRaw = await fs.readFile("./00_CrearProyecto.json", "utf8");
  const inputJsonRaw = await fs.readFile("./Ejemplo-modelo-info.json", "utf8");

  const escapedInputJson = JSON.stringify(inputJsonRaw).slice(1, -1);
  const requestBodyRaw = promptTemplateRaw.replace("%%ijson%%", escapedInputJson);

  const requestBody = JSON.parse(requestBodyRaw);

  const response = await client.responses.create(requestBody);

  console.log(response.output_text);
}

main().catch(console.error);
```

[1]: https://developers.openai.com/api/docs/guides/migrate-to-responses/?utm_source=chatgpt.com "Migrate to the Responses API"
[2]: https://developers.openai.com/api/reference/resources/responses/methods/create/?utm_source=chatgpt.com "Create a model response | OpenAI API Reference"
