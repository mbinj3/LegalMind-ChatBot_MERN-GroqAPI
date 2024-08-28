const Groq = require('groq-sdk');

const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

const userQuery = async (req, res) => {
    const userQuestion = req.body.formData;

    try{
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `Summarize the case details and identify relevant legal sections: ${userQuestion}`
                }
            ],
            model: "llama3-groq-70b-8192-tool-use-preview",
            // model: "mixtral-8x7b-32768",
        });

        const summary = completion.choices[0].message.content;
        
        res.status(200).json({summary});
    }catch(error){
        console.log("Error in calling the Groq API", error);
        res.status(500).json({error: "Failed to process the case details"});
    };
};
module.exports = {userQuery};