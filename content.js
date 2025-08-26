

// LinkedIn Comment Generator Content Script
class LinkedInCommentGenerator {
    constructor() {

        this.init();
    }

    init() {
        this.observeDOM();
        this.addButtonsToExistingPosts();
        this.addCaptionButtonToPostEditor();
        // this.addResplyButtonToPostsToExistingPosts();
    }

    observeDOM() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            this.addButtonToPost(node);
                            // Add the caption button

                            // this.addReplyButtonToPost(node);
                        }
                    });

                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    addButtonsToExistingPosts() {
        const commentBoxes = document.querySelectorAll('.comments-comment-box--no-avatar div .comments-comment-box__form');
        commentBoxes.forEach(box => this.addButtonToPost(box));

        const replyBoxes = document.querySelectorAll('comments-comment-box--reply div comments-comment-box__form');
        replyBoxes.forEach(box => this.addReplyButtonToPost(box));
    }


    addCaptionButtonToPostEditor() {
        // Select the container where the post editor is located
        const postEditorContainer = document.querySelector('.share-creation-state__text-editor');
        if (postEditorContainer) {
            const captionButton = document.createElement('button');
            captionButton.textContent = 'Generate Post Caption';
            captionButton.className = 'generate-caption-button'; // Add a class for styling if needed
            // Append the button to the post editor container
            postEditorContainer.appendChild(captionButton);
            // Add an event listener to the button
            captionButton.addEventListener('click', () => {
                // Select the <p> element within the editor
                const ideaElement = postEditorContainer.querySelector('.editor-content .ql-editor p');
                const ideaText = ideaElement ? ideaElement.textContent.trim() : '';
                // Check if there is any idea text
                if (ideaText) {
                    // Generate a post caption (this is a placeholder for your AI logic)
                    const generatedCaption = `Here's an idea: ${ideaText}. What do you think?`;
                    // Insert the generated caption into the text editor
                    const editor = postEditorContainer.querySelector('.editor-content .ql-editor');
                    editor.innerHTML = generatedCaption; // Replace the content with the generated caption
                } else {
                    alert('Please provide an idea before generating a caption.');
                }
            });
        }
    }

    //    addReplyButtonToPostsToExistingPosts() {
    //     console.log("Adding reply buttons to existing posts");
    //          const replyBoxes = document.querySelectorAll('comments-comment-box--reply div comments-comment-box__form');
    //         replyBoxes.forEach(box => this.addReplyButtonToPost(box));
    //     }

    addButtonToPost(element) {
        // Find comment boxes that don't already have our button
        const commentBoxes = element.querySelectorAll ?
            element.querySelectorAll('.comments-comment-box--no-avatar div .comments-comment-box__form') :
            (element.classList && element.classList.contains('comments-comment-box--no-avatar') ? [element] : []);

        commentBoxes.forEach(box => {
            if (box.querySelector('.ai-comment-btn')) return; // Already has button

            const buttonContainer = box.querySelector('.display-flex .display-flex');
            if (buttonContainer) {
                this.insertAIButton(buttonContainer, box);
            }
        });
    }


    addReplyButtonToPost(element) {


        // Find reply boxes that don't already have our button
        const replyBoxes = element.querySelectorAll ?
            element.querySelectorAll('.comments-comment-box--reply div .comments-comment-box__form') :
            (element.classList && element.classList.contains('comments-comment-box--reply') ? [element] : []);
        replyBoxes.forEach(box => {
            if (box.querySelector('.ai-reply-btn')) return; // Already has button

            const buttonContainer = box.querySelector('.display-flex .display-flex');
            if (buttonContainer) {
                this.insertAIReplyButton(buttonContainer, box);
            }
        });
    }



    insertAIButton(container, commentBox) {
        const aiButton = document.createElement('div');
        aiButton.innerHTML = `
            <button style="margin:4px" class="ai-comment-btn" title="Generate AI Comment">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7V10C2 16 6 20.9 12 22C18 20.9 22 16 22 10V7L12 2M12 4.3L19 8.2V10C19 15.1 16 19.2 12 20.9C8 19.2 5 15.1 5 10V8.2L12 4.3M11 6V9H8V11H11V14H13V11H16V9H13V6H11Z"/>
                </svg>
                AI Comment
            </button>
        `;

        aiButton.style.display = 'flex';

        const button = aiButton.firstElementChild;
        button.addEventListener('click', () => this.generateComment(button, commentBox));

        // Insert as the first child
        container.insertBefore(aiButton, container.firstChild);
    }


    insertAIReplyButton(container, commentBox) {
        const aiButton = document.createElement('div');
        aiButton.innerHTML = `
            <button style="margin:4px" class="ai-reply-btn" title="Generate AI Reply">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7V10C2 16 6 20.9 12 22C18 20.9 22 16 22 10V7L12 2M12 4.3L19 8.2V10C19 15.1 16 19.2 12 20.9C8 19.2 5 15.1 5 10V8.2L12 4.3M11 6V9H8V11H11V14H13V11H16V9H13V6H11Z"/>
                </svg>
                AI Reply
            </button>
        `;

        aiButton.style.display = 'flex';

        const button = aiButton.firstElementChild;
        // button.addEventListener('click', alert('Replying to comment module is coming soon'));

        // Insert as the first child
        container.insertBefore(aiButton, container.firstChild);
    }


    async generateComment(button, commentBox) {


        try {
            button.disabled = true;
            button.classList.add('loading');
            button.textContent = 'Generating Comment...';

            // Find the post content
            const postContent = this.extractPostContent(commentBox);
            if (!postContent) {
                throw new Error('Could not extract post content');
            }

            // Get settings
            const settings = await this.getSettings();

            // Generate comment
            const comment = await this.callGeminiAPI(postContent, settings);

            // Insert comment into the editor
            this.insertComment(commentBox, comment);

            // Reset button
            this.resetButton(button);

        } catch (error) {
            console.error('Error generating comment:', error);
            this.resetButton(button, 'Error');
            setTimeout(() => this.resetButton(button), 2000);
        }
    }


    async generateReply(button, commentBox) {


        try {
            button.disabled = true;
            button.classList.add('loading');
            button.textContent = 'Generating reply...';

            // Find the post content
            const postContent = this.extractCommentStream(commentBox);
            if (!postContent) {
                throw new Error('Could not extract comment stream content');
            }

            // Get settings
            // const settings = await this.getSettings();

            // Generate comment
            const comment = await this.callGeminiAPI(postContent, "write a one line reply to that comment");

            // Insert comment into the editor
            this.insertComment(commentBox, comment);

            // Reset button
            this.resetButton(button);

        } catch (error) {
            console.error('Error generating comment:', error);
            this.resetButton(button, 'Error');
            setTimeout(() => this.resetButton(button), 2000);
        }
    }




    extractLastCommentContent(replyBox) {
        // Navigate up to find the comment thread
        let container = replyBox.closest('.comments-thread-entity');
        if (!container) {
            return null;
        }

        // Find the last comment text content
        const lastCommentElement = container.querySelector('.comments-comment-item__main-content:last-child .update-components-text');
        if (!lastCommentElement) {
            return null;
        }

        // Extract text content, removing HTML tags but preserving line breaks
        let content = lastCommentElement.innerText || lastCommentElement.textContent || '';

        // Clean up the content
        content = content.replace(/\s+/g, ' ').trim();

        return content;
    }


    extractPostContent(commentBox) {
        // Navigate up to find the post container
        let container = commentBox.closest('.feed-shared-update-v2__control-menu-container');
        if (!container) {
            container = commentBox.closest('[data-id]');
        }

        if (!container) {
            return null;
        }

        // Find the post text content
        const textElement = container.querySelector('.update-components-text.relative.update-components-update-v2__commentary');
        if (!textElement) {
            return null;
        }

        // Extract text content, removing HTML tags but preserving line breaks
        let content = textElement.innerText || textElement.textContent || '';

        // Clean up the content
        content = content.replace(/\s+/g, ' ').trim();

        return content;
    }


    extractCommentStream(commentBox) {
        // Navigate up to find the post container
        let content;
        let textElement
        try {


            let container = commentBox.closest('.feed-shared-update-v2__comments-container');
            if (!container) {
                container = commentBox.closest('[data-id]');
            }

            if (!container) {
                return null;
            }


            // Assuming textElement is already defined as the last article element

            // Find the post text content
            const articles = container.querySelectorAll('.comments-comments-list--cr .comments-comment-list__container article');

            if (!articles) { return null; }

            const textElementFirst = articles[articles.length - 1]; // This will select the last article

            const commentItem = textElementFirst.querySelector('.comments-thread-item');

            // Extract text content, removing HTML tags but preserving line breaks
            let commentTextOnly = commentItem.innerText || commentItem.textContent || '';

            // Clean up the content
            commentTextOnly = commentTextOnly.replace(/\s+/g, ' ').trim();


            const personName = textElementFirst.querySelector('.comments-comment-meta__container .comments-comment-meta__actor .comments-comment-meta__description-container h3 .comments-comment-meta__description-title').textContent.trim();
            // Create the structured object

            textElement = {
                person: personName,
                comment: commentTextOnly// Get the inner HTML of the comment item
            };


            if (!textElement) {
                return null;
            }

            console.log("Extracted comment stream content:", textElement);

            // content = textElement

        } catch (error) {
            console.error('Error extracting comment stream specific:', error);
        }
        return textElement;
    }



    async getSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(
                ['commentStyle', 'commentLength', 'customInstructions'],
                (result) => {
                    resolve({
                        style: result.commentStyle || "casual",   // fallback if not saved
                        length: result.commentLength || "short",
                        customInstructions: result.customInstructions || ``
                    });
                }
            );
        });
    }

    async getApiKey() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['geminiApiKey'], (result) => {
                resolve(result.geminiApiKey);
            });
        });
    }

    async callGeminiAPI(postContent, settings) {
        const apiKey = await this.getApiKey();
        const prompt = this.buildPrompt(postContent, settings);


        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        let retries = 3;

        for (let i = 0; i < retries; i++) {

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No response generated.";
            }

            if (response.status === 429 && i < retries - 1) {
                console.warn(`Rate limit hit. Retrying in ${2 ** i}s...`);
                await new Promise(res => setTimeout(res, 1000 * 2 ** i));
                continue;
            }

            if (response.status === 429) {
                alert(`Gemini API rate limit exceeded. Please try again later.`);
            }

            // const commentText = await response.text()+'\n\n' + getAuthorMention(commentBox);
            const errText = await response.text();
            // const sampleText = await response;
            // const sampleText = await response.statusText.error;
            console.error('Gemini API error response:', sampleText);
            // alert(`API request failed: ${response.status} -  - ${errText}`);
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errText}`);
        }
    }



    buildPrompt(postContent, settings) {
        const lengthGuide = {
            short: '1-2 sentences',
            medium: '2-3 sentences',
            long: '3-4 sentences'
        };

        const styleGuide = {
            professional: 'professional and business-appropriate',
            casual: 'casual and friendly',
            supportive: 'supportive and encouraging',
            insightful: 'insightful and analytical',
            questioning: 'thought-provoking with questions'
        };

        let prompt = `Write a ${styleGuide[settings.style]} LinkedIn comment in response to this post. The comment should be ${lengthGuide[settings.length]} long.

Post content: "${postContent}"

Guidelines:
- Write in a casual, human, natural tone
- Be authentic and add value to the conversation
- Avoid generic responses like "Great post!" or "Thanks for sharing"
- Be specific and reference something from the post
- Use appropriate LinkedIn etiquette
- Don't use hashtags unless very relevant
- Keep it conversational but professional
IMPORTANT: Format the comment as **HTML** for LinkedIn editor
 • Wrap each paragraph in <p> … </p>
 • Use <br> only if a single line break is needed inside a paragraph
 • Do not include <html>, <body>, or any surrounding tags
 • Example:
     <p>First Line</p>
     <p>Next Line</p>
     <p>Last Line</p>
 - No hashtags unless critically relevant
 - Do not output filler comments like “Great post” or “Thanks for sharing”
 - Avoid generic phrases like "I agree" or "Interesting point"
 - Lines gaps would be good to separate thoughts
 - Never use emojis or excessive punctuation like "!!" or "--"
 - Engage directly with specific points from the post rather than being generic
 - Show empathy if the post is personal or emotional
 - Be polite if disagreeing: acknowledge valid points before offering your perspective
 - Add value to the conversation with a fresh thought, perspective, or quick example

${settings.customInstructions ? `Additional instructions: ${settings.customInstructions}` : ''}

Write only the comment text, no quotes or formatting:`;

        return prompt;
    }

    insertComment(commentBox, comment) {
        // Find the content editable div
        const editor = commentBox.querySelector('.ql-editor[contenteditable="true"]');
        if (!editor) {
            throw new Error('Could not find comment editor');
        }

        // Detect if the comment is already HTML
        const isHTML = /<\/?[a-z][\s\S]*>/i.test(comment);

        // Clear existing content and insert as HTML
        editor.innerHTML = isHTML ? comment : `<p>${comment}</p>`;

        // Trigger input event to update LinkedIn's internal state
        const event = new Event('input', { bubbles: true });
        editor.dispatchEvent(event);

        // Focus the editor
        editor.focus();
    }


    resetButton(button, text = null) {
        button.disabled = false;
        button.classList.remove('loading');
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7V10C2 16 6 20.9 12 22C18 20.9 22 16 22 10V7L12 2M12 4.3L19 8.2V10C19 15.1 16 19.2 12 20.9C8 19.2 5 15.1 5 10V8.2L12 4.3M11 6V9H8V11H11V14H13V11H16V9H13V6H11Z"/>
            </svg>
            ${text || 'AI Comment'}
        `;
    }
}

// Initialize the extension when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LinkedInCommentGenerator();
    });
} else {
    new LinkedInCommentGenerator();
}