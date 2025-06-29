## Name:
Smart Fridge

## Team Members:
| Name          | Email                        | UTORid     |
|---------------|------------------------------|------------|
| Jieying Gong  | jieying.gong@mail.utoronto.ca | gongjiey   |
| Qingchuan Liu | skylar.liu@mail.utoronto.ca   | liuqin66   |

## Description:
Smart Fridge is an AI-powered web tool that helps users generate recipes based on the current contents of their fridge and manage food by expiration dates. By uploading photos of fridge contents, grocery receipts, or manually entering ingredients, users can track what they have and receive personalized recipe suggestions that use only food in their fridge. The system leverages AI image recognition and large language models to extract ingredient data, store it in a PostgreSQL database, and generate recipes that prioritize available and soon-to-expire items.

## Modern frontend framework of choice:
Angular

## Additional feature:
We chose to use the “Task Queue” additional requirement by processing image uploads (photos of fridge contents and grocery receipts) asynchronously.
### Feature description:  
When users upload photos of fridge contents or grocery receipts (which may involve a large number of images), the system does not process the images synchronously. Instead, it adds the processing tasks to a background task queue. A separate worker process asynchronously performs image recognition and ingredient extraction, and writes the results into the database upon completion.

## MileStones:
### Alpha Version:
1. Docker and other environment building & settings
2. Register and login page
3. Design PostgreSQL database
    -	Main page basic UI design allowing manually input data to database
    - 	Manually database operation (input, update, delete, sorting…..)
4. Integrate AI (GPT) API to generate basic recipes based on ingredient data by default

### Beta Version:
1. Image recognition AI and parse into data to be saved into database (Task queue)
2. Stripe-based subscription payment system and payment page
3. (optional for beta) More detailed recipe generation AI prompt that incorporates user preferences and prioritizes ingredients based on expiration dates
    - User preference settings and tagging system for ingredients and recipes.

### Final Version:
1. Refine UI layout and enhance styling, organize Vue 3 page structure, and add animations and interactive elements
2. Integration and refinement of AI prompts.
3. Feature testing
