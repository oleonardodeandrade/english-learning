export const fetchGPTLessons = async () => {
  console.log('Fetching lessons from GPT-3 API...');
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        
      },
      body: JSON.stringify({
        "model": "gpt-4o",
        "messages": [
          {
            "role": "system",
            "content": "You are a helpful assistant."
          },
          {
            "role": "user",
            "content": "Hello!"
          }
        ]
      }),
    });

    const endTime = Date.now();
    console.log(`GPT-3 API response time: ${endTime - startTime}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch lessons from GPT-3: ${errorText}`);
      throw new Error(`Failed to fetch lessons from GPT-3: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Lessons fetched from GPT-3:', data);
    return data.choices[0]?.message?.content;
  } catch (error) {
    console.error('Error during GPT-3 API call:', error);
    throw error;
  }
};
