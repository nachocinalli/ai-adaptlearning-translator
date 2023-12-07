import endent from 'endent';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser';

const createPrompt = (
  inputLanguage: string,
  outputLanguage: string,
  inputCode: string,
) => {
 
    return endent`
      You are an expert translator in all languages. Translate the "${inputLanguage}" to "${outputLanguage}". You only have to translate the texts that are in the property values. You don't have to change the texts of the properties. Also don't modify the values for the properties "_id", "_type", "_classes", "_htmlClasses". \`\`\`.
  
      Example translating from English to Spanish:
  
      JSON code:
      {
        "_id": "course",
        "_type": "course",
        "_classes": "course-blue",
        "_htmlClasses": "course-html-blue",
        "title": "Course title",
        "displayTitle": "Adapt Version 5",
        "description": "A sample course demonstrating the capabilities of the Adapt Framework",
        "body": "Welcome to the demonstration build for version 5 of the Adapt framework."
      }
  
      JSON code:
      {
        "_id": "course",
        "_type": "course",
        "_classes": "course-blue",
        "_htmlClasses": "course-html-blue",
        "title": "Título del curso",
        "displayTitle": "Adapt versión 5",
        "description": "Un ejemplo de curso que demuestra las capacidades de Adapt Framework",
        "body": "Bienvenido a la versión de demostración de la versión 5 de Adapt."
      }
      
      ${inputLanguage} code:
      ${inputCode}

      ${outputLanguage} code (no \`\`\`):
     `;
  
};

export const OpenAIStream = async (
  inputLanguage: string,
  outputLanguage: string,
  inputCode: string,
  model: string,
  key: string,
) => {
  const prompt = createPrompt(inputLanguage, outputLanguage, inputCode);

  const system = { role: 'system', content: prompt };

  const res = await fetch(`https://api.openai.com/v1/chat/completions`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key || process.env.OPENAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model,
      messages: [system],
      temperature: 0,
      stream: true,
    }),
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (res.status !== 200) {
    const statusText = res.statusText;
    const result = await res.body?.getReader().read();
    throw new Error(
      `OpenAI API returned an error: ${
        decoder.decode(result?.value) || statusText
      }`,
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;

          if (data === '[DONE]') {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};
