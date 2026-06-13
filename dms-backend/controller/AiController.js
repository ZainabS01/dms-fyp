const AiChat = require('../models/AiChat');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

const DIAGRAM_MAP = {
  digestive: {
    title: "Human Digestive System Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Digestive_system_diagram_edit.svg",
    description: "Here is a detailed diagram of the human digestive system, showing the main organs involved in digestion (mouth, esophagus, stomach, liver, pancreas, intestines, etc.):"
  },
  heart: {
    title: "Human Heart Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Diagram_of_the_human_heart_%28cropped%29.svg",
    description: "Here is a detailed diagram of the human heart, showing the chambers, valves, and major blood vessels:"
  },
  brain: {
    title: "Human Brain Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Lobes_of_the_brain_NL.svg",
    description: "Here is a diagram of the human brain showing its different lobes and regions:"
  },
  cell: {
    title: "Cell Structure Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Plant_cell_structure-en.svg",
    description: "Here is a diagram showing the structure of a cell (specifically a plant cell, illustrating organelles like chloroplasts, cell wall, and nucleus):"
  },
  plant: {
    title: "Plant Cell Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Plant_cell_structure-en.svg",
    description: "Here is a diagram showing the structure of a plant cell with its components labeled:"
  },
  animal: {
    title: "Animal Cell Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Animal_cell_structure_en.svg",
    description: "Here is a diagram showing the structure of an animal cell with its organelles labeled:"
  },
  atom: {
    title: "Atom Bohr Model Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Bohr_model_of_the_hydrogen_atom.svg",
    description: "Here is a diagram of the Bohr model of an atom, illustrating electrons orbiting the nucleus in energy levels:"
  },
  dna: {
    title: "DNA Double Helix Structure",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/77/DNA_chemical_structure.svg",
    description: "Here is a diagram of the chemical structure of a DNA double helix, showing base pairs (Adenine, Thymine, Cytosine, Guanine):"
  },
  respiratory: {
    title: "Respiratory System Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/0/07/Respiratory_system_complete_en.svg",
    description: "Here is a diagram of the human respiratory system, showing the trachea, bronchi, lungs, and alveoli:"
  },
  circulatory: {
    title: "Circulatory System Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/2/29/Circulatory_System_en.svg",
    description: "Here is a diagram of the human circulatory system, illustrating blood flow between the heart, lungs, and body organs:"
  },
  nervous: {
    title: "Nervous System Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Nervous_system_diagram.png",
    description: "Here is a diagram of the human nervous system, showing the brain, spinal cord, and network of nerves:"
  },
  skeletal: {
    title: "Skeletal System Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/1/11/Skeletal_system_en.svg",
    description: "Here is a diagram of the human skeletal system, displaying the primary bones in the human body:"
  },
  solar: {
    title: "Solar System Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/d/db/Solar_System_size_and_distance_scale.png",
    description: "Here is a diagram of the solar system showing planets orbiting the Sun:"
  },
  water: {
    title: "Water Cycle Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Water_Cycle_Diagram.png",
    description: "Here is a diagram illustrating the water cycle (condensation, precipitation, evaporation, transpiration):"
  },
  photosynthesis: {
    title: "Photosynthesis Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/d/db/Photosynthesis_equation.svg",
    description: "Here is a diagram showing the process of photosynthesis, where plants convert carbon dioxide and water into oxygen and glucose using sunlight:"
  },
  network: {
    title: "Network Topologies Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/97/NetworkTopologies.svg",
    description: "Here is a diagram of common network topologies (Bus, Star, Ring, Mesh, Tree, Hybrid):"
  },
  computer: {
    title: "Computer Architecture Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Harvard_architecture.svg",
    description: "Here is a block diagram illustrating basic computer architecture (Harvard architecture):"
  },
  database: {
    title: "Database ERD Example Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/72/ERD_Representation.svg",
    description: "Here is a sample Entity-Relationship Diagram (ERD) showing database design entities and relations:"
  },
  osi: {
    title: "OSI Model 7 Layers Diagram",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/be/Osi-model-7-layers.png",
    description: "Here is a diagram showing the 7 layers of the OSI model (Physical, Data Link, Network, Transport, Session, Presentation, Application):"
  }
};

const ensureValidDiagramUrls = (text) => {
  if (!text) return text;
  return text.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
    const combined = (alt + " " + url).toLowerCase();
    for (const key of Object.keys(DIAGRAM_MAP)) {
      if (combined.includes(key)) {
        return `![${DIAGRAM_MAP[key].title}](${DIAGRAM_MAP[key].url})`;
      }
    }
    return match;
  });
};

const { PDFParse } = require('pdf-parse');

const extractTextFromFile = async (base64DataUrl) => {
  try {
    if (base64DataUrl.startsWith('data:application/pdf;base64,')) {
      const base64Data = base64DataUrl.replace('data:application/pdf;base64,', '');
      const buffer = Buffer.from(base64Data, 'base64');
      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      const text = data.text || '';
      await parser.destroy();
      return text;
    } else if (base64DataUrl.startsWith('data:text/plain;base64,')) {
      const base64Data = base64DataUrl.replace('data:text/plain;base64,', '');
      const text = Buffer.from(base64Data, 'base64').toString('utf-8');
      return text;
    }
    return '';
  } catch (error) {
    console.error("Error extracting text from file:", error);
    return `[Error extracting text from document: ${error.message}]`;
  }
};

// Helper function to query the OpenAI Chat Completions API
const fetchOpenAIResponse = async (messagesHistory, teacherList = []) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    // Graceful fallback if no API key is set in .env
    return {
      text: "OpenAI API Key is not configured in the backend .env file. Please add your key to get real answers!",
      suggestions: ["What is DMS?", "Paper solution"]
    };
  }

  try {
    const teacherContext = teacherList.length > 0
      ? `Here is the list of faculty/teachers registered in this system: ${teacherList.map(t => `${t.name} (${t.department} Department)`).join(', ')}.`
      : "Currently, there are no teachers registered in the system database.";

    const formattedHistory = [];
    for (const msg of messagesHistory) {
      if (msg.image) {
        if (msg.image.startsWith('data:application/pdf') || msg.image.startsWith('data:text/plain')) {
          console.log("Parsing attached file in history...");
          const extractedText = await extractTextFromFile(msg.image);
          const fileDescription = msg.image.startsWith('data:application/pdf') ? "[Attached PDF Document]" : "[Attached Text File]";
          const combinedContent = `${msg.content || 'Describe this file.'}\n\n${fileDescription}:\n${extractedText}`;
          formattedHistory.push({
            role: msg.role,
            content: combinedContent
          });
        } else {
          formattedHistory.push({
            role: msg.role,
            content: [
              { type: "text", text: msg.content || 'Describe this image.' },
              { type: "image_url", image_url: { url: msg.image } }
            ]
          });
        }
      } else {
        formattedHistory.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    const formattedMessages = [
      {
        role: "system",
        content: `You are NEXI, the Intelligent Helper for the Department Management System (DMS). 
DMS digitalizes academic and administrative processes. 
Answers should be highly professional, informative, detailed, and friendly. Provide comprehensive, thorough, and helpful explanations to the user's questions instead of keeping them overly brief.
You are fully allowed to answer any general knowledge, coding, academic, or other questions globally. If the user asks for statistics or information, provide your best knowledge-based details or estimates instead of refusing, indicating they are estimates if necessary.

IMAGE GENERATION AND DIAGRAM REQUESTS:
You are fully capable of displaying educational images, drawings, and diagrams.
- IMPORTANT: Custom image generation (DALL-E) is currently unavailable due to API key limitations. Therefore, do NOT output '[GENERATE_IMAGE]' under any circumstances.
- If the user asks for any image, drawing, diagram, or illustration (such as a digestive system, plant cell, animal cell, heart structure, atom structure, solar system, network topology, CPU diagram, database ERD, etc.), you MUST return a standard Markdown image link to a high-quality, relevant, and reliable public image from Wikimedia Commons (or another reliable public domain source) so it renders directly in the chat bubble.
- If the user asks to save, download, export, or generate notes, diagrams, or responses in PDF or picture form, explain to them that they can save the notes directly as a PDF by clicking the "Download PDF" button located at the bottom of the chat response bubble.
Example: If the user asks for a digestive system diagram, return: "Here is a detailed diagram of the human digestive system:\n\n![Digestive System](https://upload.wikimedia.org/wikipedia/commons/c/c5/Digestive_system_diagram_edit.svg)"

${teacherContext}
If the user asks about the teachers, faculty, or staff in the department or system, you MUST look up the registered teacher list provided above and answer directly with their names and departments (e.g. naming Khadija and Zainab in the COMPUTER SCIENCE department). Do NOT say that DMS does not list teachers. Use the registered teacher list to answer directly.
If the user asks questions about DMS features, guide them as follows:
- Paper solutions are under "Course Data".
- Timetables are under "Timetable".
- Attendance is under "Attendance".
- Tasks & projects are under "Tasks & Projects".
- Academic results are under "Academic Result".
- Queries can be submitted in "Query Hub".
Always return your reply as a JSON object with exactly two fields:
1. "reply": a string containing your response to the user.
2. "suggestions": an array of 2 related follow-up quick question strings.
Example structure: {"reply": "Paper solutions are in Course Data.", "suggestions": ["How to download them?", "Where is Timetable?"]}`
      },
      ...formattedHistory
    ];

    console.log("SENDING REQUEST TO OPENAI WITH MESSAGES:", JSON.stringify(formattedMessages, null, 2));
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: formattedMessages,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    console.log("OPENAI RESPONSE:", JSON.stringify(data, null, 2));
    if (data.choices && data.choices[0]) {
      let parsedContent;
      try {
        parsedContent = JSON.parse(data.choices[0].message.content);
      } catch (parseError) {
        parsedContent = {
          reply: data.choices[0].message.content,
          suggestions: ["What is DMS?", "Paper solution"]
        };
      }
      return {
        text: parsedContent.reply,
        suggestions: parsedContent.suggestions || []
      };
    }
    throw new Error("Invalid OpenAI response structure");
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return {
      text: "Sorry, I am facing an issue connecting to the AI brain right now.",
      suggestions: ["What is DMS?", "Paper solution"]
    };
  }
};

// Helper function to call OpenAI DALL-E Image Generation API
const generateDallEImage = async (prompt) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error("OpenAI API Key is not configured in the backend .env file.");
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024"
    })
  });

  const data = await response.json();
  if (data.data && data.data[0] && data.data[0].url) {
    return data.data[0].url;
  }
  throw new Error(data.error?.message || "Failed to generate image");
};

// Helper function to download DALL-E image and save it locally in /uploads
const downloadImage = async (url) => {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `generated_${Date.now()}.png`;
    const localPath = path.join(__dirname, '../uploads', fileName);
    fs.writeFileSync(localPath, buffer);
    return `uploads/${fileName}`;
  } catch (error) {
    console.error("Failed to download generated image:", error);
    return url; // Fallback to remote URL
  }
};

// Orchestrator helper to call chat completions and optionally run DALL-E image generation
const processAiResponse = async (history, teachers) => {
  const aiResponse = await fetchOpenAIResponse(history, teachers);
  
  if (aiResponse.text && aiResponse.text.startsWith('[GENERATE_IMAGE]')) {
    const prompt = aiResponse.text.replace('[GENERATE_IMAGE]', '').trim();
    const lowerPrompt = prompt.toLowerCase();
    
    // Check if the prompt matches any of our educational diagram fallbacks
    let matchedDiagram = null;
    for (const key of Object.keys(DIAGRAM_MAP)) {
      if (lowerPrompt.includes(key)) {
        matchedDiagram = DIAGRAM_MAP[key];
        break;
      }
    }

    if (matchedDiagram) {
      console.log(`Matched prompt "${prompt}" to educational diagram: ${matchedDiagram.title}. Bypassing DALL-E.`);
      return {
        text: matchedDiagram.description,
        image: matchedDiagram.url,
        suggestions: ["Describe this diagram", "Show another diagram"]
      };
    }

    try {
      console.log(`Generating DALL-E image for prompt: "${prompt}"`);
      const imageUrl = await generateDallEImage(prompt);
      const localUrl = await downloadImage(imageUrl);
      return {
        text: `Here is the image I generated for: "${prompt}"`,
        image: localUrl,
        suggestions: ["Modify this image", "Generate another image"]
      };
    } catch (err) {
      console.error("DALL-E Generation error:", err);
      
      // Fallback check on error
      let fallbackMatch = null;
      for (const key of Object.keys(DIAGRAM_MAP)) {
        if (lowerPrompt.includes(key)) {
          fallbackMatch = DIAGRAM_MAP[key];
          break;
        }
      }

      if (fallbackMatch) {
        console.log(`DALL-E failed. Matched prompt "${prompt}" to fallback diagram: ${fallbackMatch.title}`);
        return {
          text: fallbackMatch.description,
          image: fallbackMatch.url,
          suggestions: ["Describe this diagram", "Show another diagram"]
        };
      }

      return {
        text: `I tried to generate an image for "${prompt}" but DALL-E image generation is currently disabled due to API key limitations. However, you can ask for educational diagrams (e.g. digestive system, plant cell, OSI layers, heart structure) and I will display them directly!`,
        image: null,
        suggestions: ["Show digestive system", "What is DMS?"]
      };
    }
  }

  // Ensure any markdown image URLs in general text are valid & verified
  const validatedText = ensureValidDiagramUrls(aiResponse.text);

  return {
    text: validatedText,
    image: null,
    suggestions: aiResponse.suggestions
  };
};

// 1. Get all conversations of logged in user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await AiChat.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ success: true, conversations: chats });
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ success: false, message: "Failed to get conversations" });
  }
};

// 2. Create a new conversation and get AI response
exports.createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { text, image } = req.body;

    if ((!text || !text.trim()) && !image) {
      return res.status(400).json({ success: false, message: "Message text or image is required" });
    }

    const promptText = (text && text.trim()) ? text : "Describe this image.";
    const titleText = (text && text.trim()) ? text : "Image Uploaded";

    const history = [{ role: 'user', content: promptText, image: image || null }];
    const teachers = await User.find({ role: 'teacher' }).select('name department');
    const aiResponse = await processAiResponse(history, teachers);

    const newChat = new AiChat({
      user: userId,
      title: titleText.length > 25 ? titleText.slice(0, 22) + '...' : titleText,
      messages: [
        { sender: 'user', text: promptText, image: image || null },
        { sender: 'ai', text: aiResponse.text, image: aiResponse.image, suggestions: aiResponse.suggestions }
      ]
    });

    await newChat.save();
    res.status(201).json({ success: true, conversation: newChat });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ success: false, message: "Failed to start conversation" });
  }
};

// 3. Add a message to existing conversation and get AI response
exports.addMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { text, image } = req.body;

    if ((!text || !text.trim()) && !image) {
      return res.status(400).json({ success: false, message: "Message text or image is required" });
    }

    const chat = await AiChat.findOne({ _id: id, user: userId });
    if (!chat) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const promptText = (text && text.trim()) ? text : "Describe this image.";

    // Format message history for OpenAI
    const history = [];
    const contextMessages = chat.messages.slice(-10); // Context window of last 10 messages
    contextMessages.forEach(msg => {
      history.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
        image: msg.image || null
      });
    });
    history.push({ role: 'user', content: promptText, image: image || null });

    const teachers = await User.find({ role: 'teacher' }).select('name department');
    const aiResponse = await processAiResponse(history, teachers);

    chat.messages.push({ sender: 'user', text: promptText, image: image || null });
    chat.messages.push({ sender: 'ai', text: aiResponse.text, image: aiResponse.image, suggestions: aiResponse.suggestions });

    await chat.save();
    res.json({ success: true, conversation: chat });
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

// 4. Delete a conversation
exports.deleteConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const chat = await AiChat.findOneAndDelete({ _id: id, user: userId });
    if (!chat) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    res.json({ success: true, message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ success: false, message: "Failed to delete conversation" });
  }
};

// 5. Edit a user message and regenerate response from that point
exports.editMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, messageId } = req.params;
    const { text, image } = req.body;

    if ((!text || !text.trim()) && !image) {
      return res.status(400).json({ success: false, message: "Message text or image is required" });
    }

    const chat = await AiChat.findOne({ _id: id, user: userId });
    if (!chat) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    // Find the index of the edited user message
    const msgIndex = chat.messages.findIndex(m => m._id.toString() === messageId);
    if (msgIndex === -1) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const promptText = (text && text.trim()) ? text : "Describe this image.";

    // Update the message text and image if provided
    chat.messages[msgIndex].text = promptText;
    if (image !== undefined) {
      chat.messages[msgIndex].image = image || null;
    }

    // Discard all messages after this user message
    chat.messages = chat.messages.slice(0, msgIndex + 1);

    // Reconstruct history up to this point
    const history = [];
    chat.messages.forEach(msg => {
      history.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
        image: msg.image || null
      });
    });

    const teachers = await User.find({ role: 'teacher' }).select('name department');
    const aiResponse = await processAiResponse(history, teachers);

    // Push new AI response
    chat.messages.push({
      sender: 'ai',
      text: aiResponse.text,
      image: aiResponse.image,
      suggestions: aiResponse.suggestions
    });

    await chat.save();
    res.json({ success: true, conversation: chat });
  } catch (error) {
    console.error("Error editing message:", error);
    res.status(500).json({ success: false, message: "Failed to edit message" });
  }
};
