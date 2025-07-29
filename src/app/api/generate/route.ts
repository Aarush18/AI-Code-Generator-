import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {

  try {
    const { prompt, history } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Verify that the OpenAI API key is configured.
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }


    // Create the system prompt for code generation
    const systemPrompt = `You are an expert software developer. Generate clean, production-ready code based on the user's request. 
    
    Requirements:
    - Write clean, well-commented code
    - Follow best practices and modern conventions
    - Include proper error handling
    - Use TypeScript when appropriate
    - Return only the code, no explanations unless specifically requested
    - If the request is unclear, ask for clarification or make reasonable assumptions
    
    Use chain of thought to generate code like follow these steps before generating the code

    1) Plan 
    2) Think
    3) Validate
    4) Output 

    For Example :
   Prompt-> "User" : Generate a snake game using react 
   #Plan "Assistant" : The user wants to create a snake game using react . I will prepare a plan for the best output in accordance with the users prompt
   #Think "Assistant" : For creating a snake game i have to first compute the list of the resources required . try to go through react documentation and get all required latest code files . I have to make the project typesafe and start generating code
   #Validate "Assistant" : Once the code is being generating . start looking for any discrepancies / bugs and look for best solutions . Do not present the output yet. 
   #Output "Assitant" : Generate the code output in this stage
    `;


    // Build the messages array, including history if provided

    // Build the messages array, including history if provided
    type Message = { role: 'system' | 'user' | 'assistant'; content: string };
    let messages: Message[] = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    // If history is provided and is an array, append it
    if (Array.isArray(history)) {
      // Each item should be { role: 'user' | 'assistant', content: string }
      messages = messages.concat(
        history
          .filter((msg: any) => msg && typeof msg.role === 'string' && typeof msg.content === 'string')
          .map((msg: any) => ({
            role: msg.role === 'user' || msg.role === 'assistant' ? msg.role : 'user',
            content: msg.content
          }))
      );
    }

    // Add the latest user prompt
    messages.push({
      role: "user",
      content: `Generate code for: ${prompt}`
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as any, // OpenAI SDK expects ChatCompletionMessageParam[]
      temperature: 0.3, // Lower temperature for more consistent code generation
      max_tokens: 2000,
    });

    const generatedCode = completion.choices[0]?.message?.content || '// No code generated';


    return NextResponse.json({
      code: generatedCode,
      prompt: prompt,
      history: [
        ...(Array.isArray(history) ? history : []),
        { role: "user", content: `Generate code for: ${prompt}` },
        { role: "assistant", content: generatedCode }
      ]
    });

  } catch (error) {
    console.error('Error generating code:', error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid OpenAI API key' },
          { status: 401 }
        );
      }
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'OpenAI API quota exceeded' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate code!' },
      { status: 500 }
    );
  }
}
