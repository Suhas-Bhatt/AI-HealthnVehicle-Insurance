// backend/processor.js
// This is a sample AWS Lambda function structure using AWS SDK v3
const { TextractClient, AnalyzeDocumentCommand } = require("@aws-sdk/client-textract");
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const textractClient = new TextractClient({ region: "ap-south-1" });
const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" }); // Bedrock is currently best in us-east-1

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { s3Object, claimDescription } = body;

        // 1. CALL TEXTRACT (To extract data from the uploaded file)
        const textractParams = {
            Document: { S3Object: { Bucket: "your-bucket-name", Name: s3Object } },
            FeatureTypes: ["TABLES", "FORMS"]
        };
        const textractData = await textractClient.send(new AnalyzeDocumentCommand(textractParams));

        // 2. CALL BEDROCK (Concept 1: Balaji's Narrative Reconstruction)
        const prompt = `Human: Based on the extracted data: ${JSON.stringify(textractData)}, 
        reconstruct a narrative for this claim: ${claimDescription}. 
        Check for contextual truth inconsistencies. Assistant:`;

        const bedrockParams = {
            modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 1000,
                messages: [{ role: "user", content: prompt }]
            })
        };

        const bedrockResponse = await bedrockClient.send(new InvokeModelCommand(bedrockParams));
        const result = JSON.parse(new TextDecoder().decode(bedrockResponse.body));

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" }, // CORS enabled
            body: JSON.stringify({
                extractedData: textractData,
                narrative: result.content[0].text,
                truthScore: 85 // This would be calculated by your logic
            })
        };

    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ message: "Internal Server Error" }) };
    }
};
