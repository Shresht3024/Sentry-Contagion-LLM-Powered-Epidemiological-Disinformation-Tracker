import json
import logging
from openai import OpenAI
from config import settings

logger = logging.getLogger("sentry_contagion")

class LLMService:
    """
    LLMService coordinates semantic claim analyses, polarizing scoring,
    and immunizing fact-check generations via Groq (OpenAI-compatible) or
    a local rule-based mock engine.
    """
    def __init__(self):
        self.api_key = settings.groq_api_key or settings.openai_api_key
        self.base_url = settings.llm_base_url
        self.model = settings.llm_model
        
        if self.api_key:
            logger.info(f"LLM Client initialized with API Key using base_url: {self.base_url}")
            self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)
        else:
            logger.warning("No API key detected. Running LLM service in mock fallback mode.")
            self.client = None

    def analyze_claim(self, claim_text: str) -> dict:
        """
        Analyzes a disinformation claim text for:
        - Polarization Score (0-100)
        - Sensationalism Score (0-100)
        - Narrative Manipulation Score (0-100)
        - Brief text analysis explanation
        - Neutral fact-checking immunization rebuttal
        
        Attempts to call the Groq/OpenAI completion endpoints first, falling back to mock if failed.
        """
        if not claim_text or not claim_text.strip():
            return {
                "polarization": 0,
                "sensationalism": 0,
                "narrative_manipulation": 0,
                "explanation": "No text provided for analysis.",
                "rebuttal": "N/A"
            }

        if self.client:
            try:
                system_prompt = (
                    "You are a fact-checking safety classifier. You analyze social media posts to measure three metrics: "
                    "1. Polarization (0-100): How much does it drive division/us-vs-them thinking? "
                    "2. Sensationalism (0-100): Is it overly emotional, hyperbolic, or clickbait? "
                    "3. Narrative Manipulation (0-100): Does it misrepresent data, push conspiracy, or omit context? "
                    "\nProvide your assessment in strict JSON format. You must also supply a short explanation (under 60 words) "
                    "and a neutral, fact-checking rebuttal (rebuttal counter-message) that is respectful, objective, and counters "
                    "the core claim with logical evidence. "
                    "\nExample format: "
                    "{\n"
                    '  "polarization": 75,\n'
                    '  "sensationalism": 80,\n'
                    '  "narrative_manipulation": 65,\n'
                    '  "explanation": "Brief reasoning...",\n'
                    '  "rebuttal": "Neutral fact-checking statement..."\n'
                    "}"
                )
                
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Analyze this text:\n\n{claim_text}"}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2,
                    max_tokens=500
                )
                
                raw_json = response.choices[0].message.content
                logger.info(f"LLM raw response: {raw_json}")
                result = json.loads(raw_json)
                
                # Validate schema fields
                required_fields = ["polarization", "sensationalism", "narrative_manipulation", "explanation", "rebuttal"]
                if all(field in result for field in required_fields):
                    # Enforce integer types
                    result["polarization"] = int(result["polarization"])
                    result["sensationalism"] = int(result["sensationalism"])
                    result["narrative_manipulation"] = int(result["narrative_manipulation"])
                    return result
                
                logger.warning("LLM response did not contain all required JSON fields. Falling back to parser validation.")
            except Exception as e:
                logger.error(f"Error querying Groq/OpenAI API: {e}. Falling back to mock analyzer.")
                
        # Mock Fallback Algorithm
        return self._generate_mock_analysis(claim_text)

    def _generate_mock_analysis(self, text: str) -> dict:
        """
        Local heuristic analysis engine for parsing disinformation claims offline.
        Uses keyphrase matching to determine plausible propagation scores and responses.
        """
        text_lower = text.lower()
        
        # Default scores
        polarization = 15
        sensationalism = 20
        narrative_manipulation = 10
        explanation_parts = []
        rebuttal = "This claim should be verified with reliable news outlets and official government notices."

        # Topic detection
        if any(keyword in text_lower for keyword in ["vaccine", "covid", "microchip", "autism", "virus", "pharma"]):
            polarization += 60
            sensationalism += 55
            narrative_manipulation += 70
            explanation_parts.append("Contains medical misinformation and conspiracy claims targeting healthcare systems.")
            rebuttal = (
                "Numerous peer-reviewed clinical studies and public health organizations (WHO, CDC) confirm "
                "that vaccine candidates undergo rigorous safety phases. There is no evidence supporting microchip "
                "integration or coordinated bio-weapon deployment."
            )
        elif any(keyword in text_lower for keyword in ["election", "vote", "rigged", "fraud", "ballot", "stolen"]):
            polarization += 70
            sensationalism += 60
            narrative_manipulation += 65
            explanation_parts.append("Addresses highly polarizing political integrity topics, promoting election distrust.")
            rebuttal = (
                "State election departments, audits, and judicial reviews have consistently verified "
                "the integrity of ballot systems. Claims of systemic voting machines rigging are unsupported "
                "by verifiable forensic evidence."
            )
        elif any(keyword in text_lower for keyword in ["alien", "ufo", "conspiracy", "illuminati", "coverup"]):
            polarization += 30
            sensationalism += 70
            narrative_manipulation += 50
            explanation_parts.append("Relies on classic sensationalist cover-up narratives lacking factual proof.")
            rebuttal = (
                "While aerial phenomena are investigated by aerospace researchers, no evidence linking "
                "them to extraterrestrial cover-ups or secret societies has been verified by the scientific community."
            )
        elif any(keyword in text_lower for keyword in ["climate", "warming", "fake", "hoax", "co2", "greenhouse"]):
            polarization += 55
            sensationalism += 40
            narrative_manipulation += 60
            explanation_parts.append("Challenges consensus environmental science using politically charged rhetoric.")
            rebuttal = (
                "97% of actively publishing climate scientists agree that human activities are driving "
                "global warming. Satellite telemetry and global ice core samples document a significant rise in CO2 levels."
            )

        # Catch-all high sensation words
        if any(word in text_lower for word in ["urgent", "secret", "they don't want you to know", "shocking", "destroy"]):
            sensationalism = min(100, sensationalism + 25)
            polarization = min(100, polarization + 10)
            explanation_parts.append("Uses sensationalist/emotional clickbait language to incite fear or excitement.")
            
        if not explanation_parts:
            explanation = "Claim analyzed with default low risk. Text contains generic opinions with low emotional signaling."
        else:
            explanation = " ".join(explanation_parts)

        # Normalize boundaries
        return {
            "polarization": min(100, max(0, polarization)),
            "sensationalism": min(100, max(0, sensationalism)),
            "narrative_manipulation": min(100, max(0, narrative_manipulation)),
            "explanation": explanation,
            "rebuttal": rebuttal
        }
