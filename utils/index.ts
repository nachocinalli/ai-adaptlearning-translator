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
  format: string,
) => {
  if (format === 'csv') {
    return endent`
      You are an expert translator in all languages. Translate the following CSV-formatted text from "${inputLanguage}" to "${outputLanguage}".
      Each row consists of a pair of values: the first value is a path or identifier, and the second value is a description or content in "${inputLanguage}". Ensure that the structure of the CSV remains intact after translation. Please provide the "${outputLanguage}" translation for each description while preserving any HTML or special characters, such as converting quotes to HTML entities if applicable.
      Example translating from English to Spanish:
  
      CSV code:
      "course/course-id/title/","Course title"
      "course/course-id/displayTitle/","<h1>Course title</h1>"
      "blocks/b-95/_trickle/_button/text/","Continue"
      "components/c-155/body/","<p>Welcome to the course.</p>"
      
  
      CSV code:
      "course/course-id/title/","Título del curso"
      "course/course-id/displayTitle/","<h1>Título del curso</h1>"
      "blocks/b-95/_trickle/_button/text/","Continuar"
      "components/c-155/body/","<p>Bienvenido al curso.</p>"
      
      ${inputLanguage} code:
      ${inputCode}

      ${outputLanguage} code (no \`\`\`):
     `;
  }
  else if (format === 'json') {
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
        "displayTitle": "Course title",
        "description": "Course description",
        "body": "Welcome to the course."
      }
  
      JSON code:
      {
        "_id": "course",
        "_type": "course",
        "_classes": "course-blue",
        "_htmlClasses": "course-html-blue",
        "title": "Título del curso",
        "displayTitle": "Título del curso",
        "description": "Descripción del curso",
        "body": "Bienvenido al curso."
      }
      
      ${inputLanguage} code:
      ${inputCode}

      ${outputLanguage} code (no \`\`\`):
     `;
  }
};

export const OpenAIStream = async (
  inputLanguage: string,
  outputLanguage: string,
  inputCode: string,
  model: string,
  format: string,
  key: string,
) => {
  const prompt = createPrompt(inputLanguage, outputLanguage, inputCode, format);
  
  const system = { role: 'system', content: prompt };

  const res = await fetch(`https://api.openai.com/v1/chat/completions`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization:`Bearer ${key || process.env.OPENAI_API_KEY}`,
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
