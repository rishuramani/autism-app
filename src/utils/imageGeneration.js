import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, you should use a backend service
});

/**
 * Generates an image for a given word using OpenAI's DALL-E
 * @param {string} word - The word to generate an image for
 * @returns {Promise<string>} - URL of the generated image
 */
export async function generateDallEImage(word) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A clear, child-friendly illustration of a "${word}". The image should be simple, colorful, and educational, suitable for speech therapy.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    return response.data[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
    // Return a fallback image URL or throw the error depending on your needs
    throw new Error(`Failed to generate image for word: ${word}`);
  }
}

export const cacheWordImage = async (word, imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        // Store in sessionStorage
        try {
          sessionStorage.setItem(`word_image_${word}`, base64data);
        } catch (e) {
          console.warn('Failed to cache image in sessionStorage:', e);
        }
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error caching image:', error);
    return null;
  }
};

export const getWordImage = async (word) => {
  // Check sessionStorage first
  const cachedImage = sessionStorage.getItem(`word_image_${word}`);
  if (cachedImage) {
    return cachedImage;
  }

  // Generate new image
  const imageUrl = await generateDallEImage(word);
  if (imageUrl) {
    return await cacheWordImage(word, imageUrl);
  }

  return null;
}; 