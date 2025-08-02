# 🔍 ViralPulse – Social Media Trend Analyzer with RAG

**ViralPulse** is an AI-powered application that uses Retrieval-Augmented Generation (RAG) to analyze real-time social media content. It identifies trending topics, tracks viral content, and explains the cultural context behind memes, movements, and sentiment shifts — across platforms like Twitter, Instagram, and Reddit.

---

## 🌐 Deployment

🔗 **Live App:** [Click here to access ViralPulse](https://social-rag-9o4f-oep2sbnxy-sriramp16s-projects.vercel.app/)

---

## 🚀 Features

* 🧠 Natural Language Query Support
* 📈 Real-Time Trend Detection from Social Media
* 🔎 Viral Content & Meme Recognition
* 🌍 Cultural Context & Sentiment Analysis
* 📊 Platform-specific Filtering (e.g., Twitter, Instagram)
* 🧃 RAG Architecture using LLM + Vector DB

---

## ⚙️ Setup Instructions

### 1. **Clone the Repository**

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. **Install Dependencies**

Make sure you have **Python 3.10+** and `pip` installed.

```bash
pip install -r requirements.txt
```

### 3. **Configure Environment Variables**

Create a `.env` file in the root directory and fill it like this:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_key
VITE_TWITTER_API_KEY=your_twitter_api_key
VITE_INSTAGRAM_API_KEY=your_instagram_api_key
VITE_FACEBOOK_API_KEY=your_facebook_api_key
```

> 🔐 Make sure your `.env` is **not committed** to Git. It's already ignored in `.gitignore`.

### 4. **Run the App Locally**

If using Streamlit:

```bash
streamlit run app.py
```

If using Gradio:

```bash
python app.py
```

---

## 🧪 Tech Stack

* 🧠 **LLMs:** OpenAI GPT-3.5/4 or HuggingFace Transformers
* 📚 **RAG Framework:** LangChain / LlamaIndex
* 🔍 **Vector DB:** Chroma / Pinecone
* 🌐 **Frontend:** Streamlit / Gradio
* 📰 **APIs:** Twitter API, Instagram Graph API, Reddit API
* 🧵 **Backend:** Supabase (optional for logging or metadata)

---

## 📌 Project Status

✅ Version 1.0: Real-time trend analysis with social media filtering and cultural context generation
🛠️ Version 1.1 (coming soon): Meme image extraction, sentiment graphs, multi-language support

---

## 🧑‍💻 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you would like to change.

---

## 📄 License

[MIT](LICENSE)
