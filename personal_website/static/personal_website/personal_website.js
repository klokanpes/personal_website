document.addEventListener('DOMContentLoaded', function() {
    // expose csrf token in the header of the site. I do not believe this is a security risk as the token is stored locally as a
    // cookie would. 
    const csrf_token = document.querySelector('meta[name="csrf"]').getAttribute('content');
    // get the navbar as a whole
    const navbar = document.querySelector('#navbar');

    // make markdown converter available to all further functions
    let converter = new showdown.Converter();

    // get navbar buttons
    const home_nav = document.querySelector('#home_nav');
    const about_me_nav = document.querySelector('#about_me_nav');
    const projects_nav = document.querySelector('#projects_nav');
    const blog_nav = document.querySelector('#blog_nav');
    const contact_nav = document.querySelector('#contact_nav');
    const mode_switch = document.querySelector('#mode_switch');

    // get terms and conditions button
    const terms_and_conditions_button = document.querySelector('#terms_and_conditions_button');

    // get content divs
    const message_div = document.querySelector('#message_div');
    const home_div = document.querySelector('#home_div');
    const about_me_div = document.querySelector('#about_me_div');
    const projects_div = document.querySelector('#projects_div');
    const blog_div = document.querySelector('#blog_div');
    const contact_div = document.querySelector('#contact_div');
    const terms_and_conditions_div = document.querySelector('#terms_and_conditions_div');

    // get footer buttons and hide one
    const github_black = document.querySelector('#github_black');
    const github_white = document.querySelector('#github_white');
    const linkedin_black = document.querySelector('#linkedin_black');
    const linkedin_white = document.querySelector('#linkedin_white');
    github_black.style.display = 'block';
    github_white.style.display = 'none';
    linkedin_black.style.display = 'block';
    linkedin_white.style.display = 'none';

    // this function checks whether the user has an active session associated with the use of the dark mode. If so, dark mode
    // will be applied from the get go.
    check_dark_mode();

    // If a user changes the color mode, his choice is stored in the database so that it can be retrieved and therefore so that 
    // the darkmode can be persistent
    mode_switch.addEventListener('click', () => {
        value = false;
        if(mode_switch.checked) {
            value = true;
        }
        fetch('/set_darkmode_preference', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrf_token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'darkmode_preference': value,
            }) 
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.success);
        })
    })

    // default styling of the footer
    const footer = document.querySelector('footer');
    footer.setAttribute('style', 'background-color: #F8F9FA; color: black;')

    // attach event listeners to the navbar buttons
    home_nav.addEventListener('click', function(event) {
        // when a navbar button is clicked, prevent the default behaviour
        event.preventDefault();
        // push the state to history so that back buttons in the browser work
        // made with help from: https://developer.mozilla.org/en-US/docs/Web/API/History/pushState &&
        // https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API
        history.pushState({page: 'home'}, '', '');
        // show the correct div with appropriate content
        show_home();
    });
    about_me_nav.addEventListener('click', function(event) {
        event.preventDefault();
        history.pushState({page: 'about_me'}, '', '');
        show_about_me();
    });
    projects_nav.addEventListener('click', function(event) {
        event.preventDefault();
        history.pushState({page: 'projects'}, '', '');
        show_projects();
    });
    blog_nav.addEventListener('click', function(event) {
        event.preventDefault();
        history.pushState({page: 'blog'}, '', '');
        show_blog();
    })
    contact_nav.addEventListener('click', function(event) {
        event.preventDefault();
        history.pushState({page: 'contact'}, '', '');
        show_contact();
    });
    terms_and_conditions_button.addEventListener('click', function(event) {
        event.preventDefault();
        history.pushState({page: 'terms_and_conditions'}, '', '');
        show_terms_and_conditions();
    })
    mode_switch.addEventListener('change', switch_mode);

    // load default page and push it into history
    show_home();
    history.pushState({page: 'home'}, '', '');

    // back functionality, adapted from https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API
    window.addEventListener('popstate', function(event) {
        if (event.state) {
            if(event.state.page === 'home') {
                show_home();
            } else if (event.state.page === 'about_me') {
                show_about_me();
            } else if (event.state.page === 'projects') {
                show_projects();
            } else if (event.state.page === 'blog') {
                show_blog();
            } else if (event.state.page === 'contact') {
                show_contact();
            } else if (event.state.page === 'terms_and_conditions') {
                show_terms_and_conditions();
            }
        }
    })

    // shows home page section
    function show_home() {
        // create default conditions to display a site
        set_scene("home");

        // fetch content from API endpoint - GET
        
        fetch('/homepage_content')
        .then(response => {
            if (response.status === 429) {
                load_error_page(429, 'Too many requests', "You have made too many requests. Please try again tomorrow.");
                return null;
            } else {
                return response.json();
            }
        })
        .then(data => {
            const content = data[0].content;
            // transform content into HTML from markdown - https://github.com/showdownjs/showdown
            html_content = converter.makeHtml(content);
            // create elements and append them to the home div
            home_div.innerHTML = html_content;
        })
        .catch(error => {
            console.error(error);
            frontend_error_log(error);
        }) 
    }

    // shows about me section
    function show_about_me() {
        set_scene("about_me");

        // fetch about_me content from an API endpoint - there will be the main content, social links, and Education, Work experience and Hobbies
        fetch('/about_me_content')
        .then(response => {
            if (response.status === 429) {
                load_error_page(429, 'Too many requests', "You have made too many requests. Please try again tomorrow.");
                return null;
            } else {
                return response.json();
            }
        })
        .then(data => {
            const content = data[0].about_me_content[0].content;
            const image_url = data[0].about_me_content[0].image_url;
            const technology_experience = data[1].technology_experience;
            const education = data[2].education;
            const work_experience = data[3].work_experience;

            // fetch info about the CV file
                // if there is one, show a button to download it
            fetch('/check_file')
            .then(response => {
                if (response.status === 429) {
                    load_error_page(429, 'Too many requests', "You have made too many requests. Please try again tomorrow.");
                    return null;
                } else {
                    return response.json();
                }
            })
            .then(data => {
                let file_flag = false;
                if (data.file) {
                    file_flag = true;
                }

                // create elements and append them to the about_me_div
                const image = document.createElement('img');
                image.setAttribute("src", image_url);
                image.setAttribute("alt", "Photograph");
                image.id = "photo";

                const content_div = document.createElement('div');
                content_div.id = 'about_me_content_div';

                const main_text_div = document.createElement('div');
                main_text_div.id = 'about_me_main_text_div';

                // transform content into HTML from markdown
                html_main_text = converter.makeHtml(content);

                // create accordion elements
                const accordion_div = document.createElement('div');
                accordion_div.id = 'accordion_div';
                accordion_div.className = 'accordion';

                // ACCORDION 1 - TECHNOLOGY EXPERIENCE
                const accordion_item_1 = document.createElement('div');
                accordion_item_1.className = 'accordion-item';
                accordion_item_1.id = 'accordion_item_1';

                const accordion_header_1 = document.createElement('h2');
                accordion_header_1.className = 'accordion-header';
                accordion_header_1.id = 'headingOne';

                const accordion_button_1 = document.createElement('button');
                accordion_button_1.className = 'accordion-button collapsed';
                accordion_button_1.id = 'accordion_button_1';
                accordion_button_1.type = 'button';
                accordion_button_1.setAttribute('data-bs-toggle', 'collapse');
                accordion_button_1.setAttribute('data-bs-target', '#collapseOne');
                accordion_button_1.setAttribute('aria-expanded', 'true');
                accordion_button_1.setAttribute('aria-controls', 'collapseOne');
                accordion_button_1.textContent = 'Technology Experience';

                const accordion_colapse_one = document.createElement('div');
                accordion_colapse_one.id = 'collapseOne';
                accordion_colapse_one.className = 'accordion-collapse collapse';
                accordion_colapse_one.setAttribute('aria-labelledby', 'headingOne');
                accordion_colapse_one.setAttribute('data-bs-parent', '#accordion')

                const accordion_body_1 = document.createElement('div');
                accordion_body_1.className = 'accordion-body';
                accordion_body_1.id = 'accordion_body_1';

                const technology_exp_list = document.createElement('ul');
                technology_exp_list.id = 'technology_exp_list';
                // append elements to the accordion with a for loop
                technology_experience.forEach(element => {
                    let new_line = document.createElement('li');
                    new_line.className = 'li_technology_exp';
                    new_line.innerHTML = `<strong>${element.name}</strong> ${element.description}`;
                    technology_exp_list.append(new_line);
                });
                accordion_body_1.append(technology_exp_list);
                accordion_colapse_one.append(accordion_body_1);
                accordion_header_1.append(accordion_button_1);
                accordion_item_1.append(accordion_header_1, accordion_colapse_one);
                accordion_div.append(accordion_item_1);
                

                // ACCORDION 2 - EDUCATION
                const accordion_item_2 = document.createElement('div');
                accordion_item_2.className = 'accordion-item';
                accordion_item_2.id = 'accordion_item_2';

                const accordion_header_2 = document.createElement('h2');
                accordion_header_2.className = 'accordion-header';
                accordion_header_2.id = 'headingTwo';

                const accordion_button_2 = document.createElement('button');
                accordion_button_2.className = 'accordion-button collapsed';
                accordion_button_2.id = 'accordion_button_2';
                accordion_button_2.type = 'button';
                accordion_button_2.setAttribute('data-bs-toggle', 'collapse');
                accordion_button_2.setAttribute('data-bs-target', '#collapseTwo');
                accordion_button_2.setAttribute('aria-expanded', 'true');
                accordion_button_2.setAttribute('aria-controls', 'collapseTwo');
                accordion_button_2.textContent = 'Education';

                const accordion_colapse_two = document.createElement('div');
                accordion_colapse_two.id = 'collapseTwo';
                accordion_colapse_two.className = 'accordion-collapse collapse';
                accordion_colapse_two.setAttribute('aria-labelledby', 'headingTwo');
                accordion_colapse_two.setAttribute('data-bs-parent', '#accordion')

                const accordion_body_2 = document.createElement('div');
                accordion_body_2.className = 'accordion-body';
                accordion_body_2.id = 'accordion_body_2';

                // append elements to the accordion with a for loop
                let i = 1;
                education.forEach(element => {
                    let new_div = document.createElement('div');
                    if (i % 2 === 0) {
                        new_div.className = 'specific_education_div_even';
                    } else {
                        new_div.className = 'specific_education_div_odd';
                    }
                    
                    let html_education =converter.makeHtml(element.description);

                    let header = document.createElement('h6');
                    header.textContent = element.name;
                    let time_spent = document.createElement('i');
                    time_spent.textContent = `${element.date_from} - ${element.date_to}`;

                    new_div.append(header, time_spent);
                    new_div.innerHTML += html_education;

                    // do not add the horizontal line on the last iteration
                    if (i !== education.length) {
                        let hr = document.createElement('hr');
                        hr.className = 'about_me_hr';
                        new_div.append(hr);
                    }
                    accordion_body_2.append(new_div);
                    i++;
                })
                accordion_colapse_two.append(accordion_body_2);
                accordion_header_2.append(accordion_button_2);
                accordion_item_2.append(accordion_header_2, accordion_colapse_two);
                accordion_div.append(accordion_item_2);


                // ACCORDION 3 - WORK EXPERIENCE
                const accordion_item_3 = document.createElement('div');
                accordion_item_3.className = 'accordion-item';
                accordion_item_3.id = 'accordion_item_3';

                const accordion_header_3 = document.createElement('h2');
                accordion_header_3.className = 'accordion-header';
                accordion_header_3.id = 'headingThree';

                const accordion_button_3 = document.createElement('button');
                accordion_button_3.className = 'accordion-button collapsed';
                accordion_button_3.id = 'accordion_button_3';
                accordion_button_3.type = 'button';
                accordion_button_3.setAttribute('data-bs-toggle', 'collapse');
                accordion_button_3.setAttribute('data-bs-target', '#collapseThree');
                accordion_button_3.setAttribute('aria-expanded', 'true');
                accordion_button_3.setAttribute('aria-controls', 'collapseThree');
                accordion_button_3.textContent = 'Work Experience';

                const accordion_colapse_three = document.createElement('div');
                accordion_colapse_three.id = 'collapseThree';
                accordion_colapse_three.className = 'accordion-collapse collapse';
                accordion_colapse_three.setAttribute('aria-labelledby', 'headingThree');
                accordion_colapse_three.setAttribute('data-bs-parent', '#accordion')

                const accordion_body_3 = document.createElement('div');
                accordion_body_3.className = 'accordion-body';
                accordion_body_3.id = 'accordion_body_3';
               
                let j = 1;
                work_experience.forEach(element => {
                    let new_work_div = document.createElement('div');
                    if (j % 2 === 0) {
                        new_work_div.className = 'work_exp_div_even';
                    } else {
                        new_work_div.className = 'work_exp_div_odd';
                    }
                    let header = document.createElement('h6');
                    header.textContent = element.name;

                    let time_spent_2 = document.createElement('i');
                    time_spent_2.textContent = `${element.date_from} - ${element.date_to}`;

                    new_work_div.append(header, time_spent_2);
                    new_work_div.innerHTML += converter.makeHtml(element.description);

                    if (j !== work_experience.length) {
                        let hr = document.createElement('hr');
                        hr.className = 'about_me_hr';
                        new_work_div.append(hr);
                    }
                    accordion_body_3.append(new_work_div);
                    j++;
                })
                accordion_colapse_three.append(accordion_body_3);
                accordion_header_3.append(accordion_button_3);
                accordion_item_3.append(accordion_header_3, accordion_colapse_three);
                accordion_div.append(accordion_item_3);

                // default display options based on whether the dark mode is enabled
                if (mode_switch.checked) {
                    accordion_header_1.style.backgroundColor = '#122023';
                    accordion_header_1.style.color = 'white';
                    accordion_header_1.style.borderRadius = '0.375rem';
                    accordion_button_1.style.backgroundColor = '#122023';
                    accordion_button_1.style.color = 'white';
                    accordion_body_1.style.backgroundColor = '#122023';
                    accordion_body_1.style.color = 'white';
                    accordion_item_1.style.border = '1px solid white';

                    accordion_header_2.style.backgroundColor = '#122023';
                    accordion_header_2.style.color = 'white';
                    accordion_header_2.style.borderRadius = '0.375rem';
                    accordion_button_2.style.backgroundColor = '#122023';
                    accordion_button_2.style.color = 'white';
                    accordion_body_2.style.backgroundColor = '#122023';
                    accordion_body_2.style.color = 'white';
                    accordion_item_2.style.border = '1px solid white';

                    accordion_header_3.style.backgroundColor = '#122023';
                    accordion_header_3.style.color = 'white';
                    accordion_header_3.style.borderRadius = '0.375rem';
                    accordion_button_3.style.backgroundColor = '#122023';
                    accordion_button_3.style.color = 'white';
                    accordion_body_3.style.backgroundColor = '#122023';
                    accordion_body_3.style.color = 'white';
                    accordion_item_3.style.border = '1px solid white';
                }


                main_text_div.innerHTML = html_main_text;
                const image_whitespace = document.createElement('div');
                image_whitespace.id = 'image_whitespace';
                content_div.append(image, image_whitespace, main_text_div);

                about_me_div.append(content_div, accordion_div);

                if (file_flag) {
                    const download_button = document.createElement('button');
                    download_button.id = 'download_button';
                    download_button.textContent = 'Download CV';
                    if (mode_switch.checked) {
                        download_button.className = 'btn btn-outline-light';
                    } else {
                        download_button.className = 'btn btn-outline-dark';
                    }
                    const donwload_button_whitespace_div = document.createElement('div');
                    donwload_button_whitespace_div.id = 'download_button_whitespace_div';

                    about_me_div.append(donwload_button_whitespace_div, download_button);
                    
                    //download functionality adapted from: https://plainenglish.io/blog/how-to-download-files-with-javascript
                    download_button.addEventListener('click', function(){
                        fetch('/file_download')
                        .then(response => {
                            if (!response.ok) {
                                if(response.status === 429) {
                                    // made with help from: https://www.sitepoint.com/community/t/early-exit-from-a-javascript-promise/422703
                                    throw new Error('You have already downloaded the file three times today. Please try again tomorrow.');
                                }else {
                                    throw new Error(`${response.statusText}`);
                                }
                            }
                            return response.blob()
                        })
                        .then(blob => {
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.style.display = 'none';
                            a.href = url;
                            a.download = `${data.file[0].name}.pdf`;
                            document.body.append(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            show_message('Success', 'The CV file you requested was downloaded.');
                        })    
                        .catch(error => {
                            console.error(error);
                            show_message('Error', error)
                            frontend_error_log(error);
                        });    
                    })
                }
            })
            .catch(error => {
                console.error(error);
                frontend_error_log(error);
            });
        })
        .catch(error => {
            console.error(error);
            frontend_error_log(error);
        });
    }
     
    // shows project section
    function show_projects(page=1) {
        set_scene("projects");

        // fetch the projects from the API endpoint
        fetch(`/projects_content/${page}`)
        .then(response => {
            if (response.status === 429) {
                load_error_page(429, 'Too many requests', "You have made too many requests. Please try again tomorrow.");
                return null;
            } else {
                return response.json();
            }
        })
        .then(data => {
            const number_of_pages = data.number_of_pages;
            const this_page_number = data.this_page_number;
            const projects = data.projects;

            // the following long comments are an earlier implementation but I thought I might be ale to make it look better so...
            // the way it works now is that there are up to ten nav tabs that allow for looking at the first ten
            // projects. If there are more projects than ten, the pagination feature comes into effect and through a next
            // button it is possible to move to another set of ten projects.

            const introduction_div = document.createElement('div');
            introduction_div.id = 'projects_introduction_div';
            
            const intro_heading = document.createElement('h5');
            intro_heading.id = 'projects_into_heading';
            intro_heading.textContent = 'Welcome to My Project Portfolio';

            const intro_text = document.createElement('p');
            intro_text.id = 'projects_into_text';
            intro_text.textContent = 'This section showcases a curated collection of my previous projects, documenting my journey as a programmer. From early explorations to more advanced creations, each project represents a step forward in my growth and learning. Explore these works to see how I approach challenges, experiment with new technologies, and turn ideas into functional, meaningful solutions.';

            introduction_div.append(intro_heading, intro_text);

            projects_div.append(introduction_div);

            /*
            if (page === 1) {
                
                const introduction_div = document.createElement('div');
                introduction_div.id = 'projects_introduction_div';
                
                const intro_heading = document.createElement('h5');
                intro_heading.id = 'projects_into_heading';
                intro_heading.textContent = 'Welcome to My Project Portfolio';

                const intro_text = document.createElement('p');
                intro_text.id = 'projects_into_text';
                intro_text.textContent = 'This section showcases a curated collection of my previous projects, documenting my journey as a programmer. From early explorations to more advanced creations, each project represents a step forward in my growth and learning. Explore these works to see how I approach challenges, experiment with new technologies, and turn ideas into functional, meaningful solutions.';

                const into_hr = document.createElement('hr');
                into_hr.id = 'projects_intro_hr';

                introduction_div.append(intro_heading, intro_text, into_hr);

                projects_div.append(introduction_div);
            }

            const all_projects_div = document.createElement('div');
            all_projects_div.id = 'all_projects_div';
            */

            // This solution was adapted from: https://getbootstrap.com/docs/5.2/components/navs-tabs/#javascript-behavior
            const nav_tab = document.createElement('ul');
            nav_tab.className = 'nav nav-tabs';
            nav_tab.id = 'navtab';

            const tab_content_div = document.createElement('div');
            tab_content_div.className = 'tab-content';
            tab_content_div.id = 'tab_content';
            // so that pagination works together with bootstrap tabs dynamically
            let i = 1;
            if (page === 1){
                i = 1;
            } else {
                i = (i * 10) - 9;
            }
            
            projects.forEach(element => {
                // this first part creates the content of the navtab with the buttons
                let new_li = document.createElement('li');
                new_li.className = 'nav-item';
                new_li.role = 'presentation';
                let new_button = document.createElement('button');
                new_button.id = `tab-${i}`;
                new_button.setAttribute('data-bs-toggle', 'tab');
                new_button.setAttribute('data-bs-target', `#tab-pane-${i}`);
                new_button.type = 'button';
                new_button.role = 'tab';
                new_button.setAttribute('aria-controls', `tab-pane-${i}`);
                new_button.textContent = `Project ${i}`;
                // starter style based on dark theme enabling
                if (i === 1) {
                    new_button.className = 'nav-link active';
                    new_button.setAttribute('aria-selected', true);
                } else {
                    new_button.className = 'nav-link';
                    new_button.setAttribute('aria-selected', false);
                    if (mode_switch.checked) {
                        new_button.classList.add('dark')
                    }
                }

                new_button.addEventListener('click', () => {
                    switch_mode();
                })

                new_li.append(new_button);
                nav_tab.append(new_li);

                // this second part creates the div that contains the actual project info
                let new_project_div = document.createElement('div');
                if (i === 1) {
                    new_project_div.className = 'tab-pane fade show active';
                } else {
                    new_project_div.className = 'tab-pane fade';
                }
                new_project_div.id = `tab-pane-${i}`;
                new_project_div.role = 'tabpanel';
                new_project_div.setAttribute('aria-labelledby', `tab-${i}`);
                new_project_div.setAttribute('tabindex', 0);
                

                // this last part populates the project info div with actual content
                let heading = document.createElement('h6');
                heading.textContent = element.name;
                // transform markdown content into HTML
                let content = converter.makeHtml(element.description);
                let github_url = element.git_hub;
                let youtube = element.youtube;

                // Create elements and append them to the projects_div
                new_project_div.append(heading);
                new_project_div.innerHTML += content;
                let github_url_a = document.createElement('a');
                github_url_a.href = github_url;
                github_url_a.textContent = github_url;
                new_project_div.append(github_url_a);
                let youtube_div = document.createElement('div');
                youtube_div.className = 'youtube_div';
                youtube_div.innerHTML = youtube;
                new_project_div.append(youtube_div);
                let youtube_backup = document.createElement('a');
                youtube_backup.className = 'youtube_backup_link'
                youtube_backup.href = element.youtube_backup;
                youtube_backup.textContent = element.youtube_backup;
                youtube_div.append(youtube_backup);

                tab_content_div.append(new_project_div);


                i++;
            })

            projects_div.append(nav_tab, tab_content_div);

            /*
            let j = 1;
            projects.forEach(element => {
                let new_project_div = document.createElement('div');
                if (j % 2 == 0) {
                    new_project_div.className = 'new_project_div_even';
                } else {
                    new_project_div.className = 'new_project_div_odd';
                }
                i++;
                let heading = document.createElement('h6');
                heading.textContent = element.name;
                // transform markdown content into HTML
                let content = converter.makeHtml(element.description);
                let github_url = element.git_hub;
                let youtube = element.youtube;

                // Create elements and append them to the projects_div
                new_project_div.append(heading);
                new_project_div.innerHTML += content;
                let github_url_a = document.createElement('a');
                github_url_a.href = github_url;
                github_url_a.textContent = github_url;
                new_project_div.append(github_url_a);
                let youtube_div = document.createElement('div');
                youtube_div.className = 'youtube_div';
                youtube_div.innerHTML = youtube;
                new_project_div.append(youtube_div);
                let youtube_backup = document.createElement('a');
                youtube_backup.className = 'youtube_backup_link'
                youtube_backup.href = element.youtube_backup;
                youtube_backup.textContent = element.youtube_backup;
                youtube_div.append(youtube_backup);
                let new_project_hr = document.createElement('hr');
                new_project_hr.className = 'project_hr';
                new_project_div.append(new_project_hr);

                projects_div.append(new_project_div);
            })
            */

            // pagination functionality
            const page_buttons_div = document.createElement('div');
            page_buttons_div.id = 'page_buttons_div';
            const next_button = document.createElement('button');
            next_button.id = 'next_button';
            next_button.textContent = 'Next Page'
            const previous_button = document.createElement('button');
            previous_button.id = 'previous_button';
            previous_button.textContent = 'Previous Page';

            if (mode_switch.checked) {
                next_button.className = 'btn btn-outline-light';
                previous_button.className = 'btn btn-outline-light';
            } else {
                next_button.className = 'btn btn-outline-dark';
                previous_button.className = 'btn btn-outline-dark';
            }
            // create pagination logic and display previous - next buttons based on the pagination
            if (this_page_number < number_of_pages && this_page_number === 1) {
                next_button.addEventListener('click', () => {
                    show_projects(this_page_number+1);
                })
                page_buttons_div.append(next_button);
            } else if (this_page_number < number_of_pages && this_page_number !== 1) {
                next_button.addEventListener('click', () => {
                    show_projects(this_page_number+1);
                })
                previous_button.addEventListener('click', () => {
                    show_projects(this_page_number-1);
                })
                page_buttons_div.append(previous_button, next_button);

            } else if (number_of_pages !== 1 && this_page_number === number_of_pages) {
                previous_button.addEventListener('click', () => {
                    show_projects(this_page_number-1);
                })
                page_buttons_div.append(previous_button);
            } else {
                // visualisation aid
            }
            projects_div.append(page_buttons_div);
        })
        .catch(error => {
            console.error(error);
            frontend_error_log(error);
        }); 
    }

    // shows blog section
    function show_blog(page=1) {
        // this function contains simple pagination, one page(blog post) at a time. 
        set_scene("blog");

        // fetch blog posts from an API endpoint
        fetch(`/blog_post/${page}`)
        .then(response => {
            if (response.status === 429) {
                load_error_page(429, 'Too many requests', "You have made too many requests. Please try again tomorrow.");
                return null;
            } else {
                return response.json();
            }
        })
        .then(data => {
            const blog_posts = data.posts;
            const number_of_pages = data.number_of_pages;
            const this_page_number = data.this_page_number;
            
            let k = 1;
            blog_posts.forEach(element => {
                let new_blog_div = document.createElement('div');
                if (k % 2 === 0) {
                    new_blog_div.className = 'new_blog_div_even';
                } else {
                    new_blog_div.className = 'new_blog_div_odd';
                }
                k++;
                let blog_header = document.createElement('h5');
                blog_header.textContent = element.title;
                // transform the content into HTML from markdown and create elements and append them to the blog_div
                let blog_content = converter.makeHtml(element.content)
                new_blog_div.append(blog_header)
                
                if (element.image !== null) {
                    let blog_image = document.createElement('img')
                    blog_image.className = 'blog_image';
                    blog_image.src = element.image;
                    blog_image.alt = 'Image';
                    new_blog_div.append(blog_image)
                }
                if (element.image_url !== '') {
                    let blog_image_url = document.createElement('img')
                    blog_image_url.className = 'blog_image';
                    blog_image_url.src = element.image_url;
                    blog_image_url.alt = 'Image';
                    new_blog_div.append(blog_image_url)
                }

                new_blog_div.innerHTML += blog_content;
                if (element.source_url !== '') {
                    let blog_source = document.createElement('a');
                    blog_source.className = 'blog_source_link';
                    blog_source.href = element.source_url;
                    blog_source.textContent = `Image source: ${element.source_url}`;
                    new_blog_div.append(blog_source);
                }
                const blog_hr = document.createElement('hr');
                blog_hr.className = 'blog_hr';
                new_blog_div.append(blog_hr);
                blog_div.append(new_blog_div);
            })

            // pagination functionality
            const page_buttons_div = document.createElement('div');
            page_buttons_div.id = 'page_buttons_div';
            const next_button = document.createElement('button');
            next_button.id = 'next_button';
            next_button.textContent = 'Next Page'
            const previous_button = document.createElement('button');
            previous_button.id = 'previous_button';
            previous_button.textContent = 'Previous Page';

            if (mode_switch.checked) {
                next_button.className = 'btn btn-outline-light';
                previous_button.className = 'btn btn-outline-light';
            } else {
                next_button.className = 'btn btn-outline-dark';
                previous_button.className = 'btn btn-outline-dark';
            }

            // create pagination logic and display previous - next buttons based on the pagination
            if (this_page_number < number_of_pages && this_page_number === 1) {
                next_button.addEventListener('click', () => {
                    show_blog(this_page_number+1);
                })
                page_buttons_div.append(previous_button, next_button);
                previous_button.style.display = 'none';
            } else if (this_page_number < number_of_pages && this_page_number !== 1) {
                next_button.addEventListener('click', () => {
                    show_blog(this_page_number+1);
                })
                previous_button.addEventListener('click', () => {
                    show_blog(this_page_number-1);
                })
                page_buttons_div.append(previous_button, next_button);

            } else if (number_of_pages !== 1 && this_page_number === number_of_pages) {
                previous_button.addEventListener('click', () => {
                    show_blog(this_page_number-1);
                })
                page_buttons_div.append(previous_button, next_button);
                next_button.style.display = 'none';
            } else {
                // visualisation aid
            }
            blog_div.append(page_buttons_div);
        })
        .catch(error => {
            console.error(error);
            frontend_error_log(error);
        });
        
    }

    // shows contact section
    function show_contact() {
        set_scene('contact')

        fetch('/contact_content')
        .then(response => {
            if (response.status === 429) {
                load_error_page(429, 'Too many requests', "You have made too many requests. Please try again tomorrow.");
                return null;
            } else {
                return response.json();
            }
        })
        // I do not use any of the data I thought I would from this fetch request. It is still here because it allows me to 
        // catch throttling being applied.
        .then(data => {
            // create email form
            // with sender email field, sender name, subject and text field
            // the text field has a counter that disables input when the limit is reached - this works thanks to html maxlenght 
            // parameter. The counter is just that, a counter.
            const new_contact_div = document.createElement('div');
            new_contact_div.id = 'new_contact_div';
            new_contact_div.className = 'mb-3'

            const email_form = document.createElement('form');
            email_form.id = 'email_form';

            // contains client side validation - done through HTML attributes and a counter

            const name_input = document.createElement('input');
            name_input.id = 'name_input';
            name_input.type = 'text';
            name_input.placeholder = 'Input Your name here.';
            name_input.name = 'name';
            name_input.className = 'form-control';
            name_input.setAttribute('autocomplete', 'off');
            name_input.setAttribute('required', true);
            name_input.setAttribute('maxlength', 200);
            const name_input_label = document.createElement('label');
            name_input_label.setAttribute('for', name_input.id);
            name_input_label.textContent = 'Your name:';
            name_input_label.className = 'form-label';
            

            const email_address = document.createElement('input');
            email_address.id = 'email_address_input';
            email_address.type = 'email';
            email_address.placeholder = 'Input Your e-mail address here.';
            email_address.name = 'email';
            email_address.className = 'form-control';
            email_address.setAttribute('autocomplete', 'off');
            email_address.setAttribute('required', true);
            email_address.setAttribute('maxlength', 200);
            const email_address_label = document.createElement('label');
            email_address_label.setAttribute('for', email_address.id);
            email_address_label.textContent = 'Your e-mail address:';
            email_address_label.className = 'form-label';

            const subject = document.createElement('input');
            subject.id = 'email_subject_input';
            subject.type = 'text';
            subject.placeholder = 'Input the subject of Your message here.';
            subject.name = 'subject';
            subject.className = 'form-control';
            subject.setAttribute('autocomplete', 'off');
            subject.setAttribute('required', true);
            subject.setAttribute('maxlength', 200);
            const subject_label = document.createElement('label');
            subject_label.setAttribute('for', subject.id);
            subject_label.textContent = 'Subject of Your message:';
            subject_label.className = 'form-label';

            const email_message = document.createElement('textarea');
            email_message.id = 'email_message_input';
            email_message.type = 'textarea';
            email_message.placeholder = 'Write Your message here.';
            email_message.name = 'message';
            email_message.className = 'form-control';
            email_message.setAttribute('rows', 5);
            email_message.setAttribute('autocomplete', 'off');
            email_message.setAttribute('required', true);
            email_message.setAttribute('maxlength', 500);
            const email_message_label = document.createElement('label');
            email_message_label.setAttribute('for', email_message.id);
            email_message_label.textContent = 'Write Your message here:';
            email_message_label.className = 'form-label';

            let current_value = 0;
            let max_value = 500;
            const email_counter = document.createElement('p');
            email_counter.textContent = `${current_value}/${max_value}`;

            email_message.addEventListener('input', () => {
                current_value = email_message.value.length
                email_counter.textContent = `${current_value}/${max_value}`;
            })

            const submit_button = document.createElement('button');
            submit_button.id = 'email_submit_button';
            submit_button.textContent = 'Send Message';

            if (mode_switch.checked) {
                submit_button.className = 'btn btn-outline-light';
            } else {
                submit_button.className = 'btn btn-outline-dark';
            }

            email_form.append(name_input_label, name_input, email_address_label, email_address, subject_label, subject, email_message_label, email_message, email_counter, submit_button);
            new_contact_div.append(email_form);
            contact_div.append(new_contact_div);
                
            // API POST request
                // there is server side validation - display response - success/error

            submit_button.addEventListener('click', function(event) {
                event.preventDefault();
                if (name_input.value !== '' && email_address.value !== '' && subject.value !== '' && email_message.value !== '') {
                    fetch('/email', {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': csrf_token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            'name': name_input.value,
                            'email': email_address.value,
                            'header': subject.value,
                            'content': email_message.value,
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.message) {
                            show_home();
                            show_message('Success', 'Your message was sent.');
                        } else {
                            show_message('Error', data.error);
                        }
                    })
                    .catch(error => {
                        console.error(error);
                        frontend_error_log(error);
                    });
                } else if (email_address.value.indexOf('@') < 0) {
                    show_message('error', 'Email address hast to contain an "@" sign.');
                } else {
                    show_message('error', 'You did not provide sufficient input.');
                }
            })
        })
        .catch(error => {
            console.error(error);
            frontend_error_log(error);
        });  
    }

    // changes color mode of the site
    function switch_mode() {
        // this function changes the visual style of all elements on the site. Some elements have to be changed while they
        // are created. This function handles dynamic changes. It is done in multiple ways, through adding a style tag or
        // through classess and then applying styles through css. I tried different approaches, so it is a combination of all.
        const navbar = document.querySelector('#navbar');
        const mode_switch_label = document.querySelector('#mode_switch_label');
        const body = document.querySelector('body');
        const all_content_div = document.querySelector('#all_content_div')
        const download_button = document.querySelector('#download_button');
        const next_button = document.querySelector('#next_button');
        const previous_button = document.querySelector('#previous_button');
        const email_submit_button = document.querySelector('#email_submit_button');
        const see_modal_again_button = document.querySelector('#see_modal_again_button');
        const accordion = document.querySelector('#accordion_div');
        const accordion_header_1 = document.querySelector('#headingOne');
        const accordion_body_1 = document.querySelector('#accordion_body_1');
        const accordion_button_1 = document.querySelector('#accordion_button_1');
        const accordion_item_1 = document.querySelector('#accordion_item_1');
        const accordion_header_2 = document.querySelector('#headingTwo');
        const accordion_body_2 = document.querySelector('#accordion_body_2');
        const accordion_button_2 = document.querySelector('#accordion_button_2');
        const accordion_item_2 = document.querySelector('#accordion_item_2');
        const accordion_header_3 = document.querySelector('#headingThree');
        const accordion_body_3 = document.querySelector('#accordion_body_3');
        const accordion_button_3 = document.querySelector('#accordion_button_3');
        const accordion_item_3 = document.querySelector('#accordion_item_3');
        const navlink = document.querySelectorAll('.nav-link');
        const toast_header = document.querySelectorAll('.toast-header');
        const toast_body = document.querySelectorAll('.toast-body');

        if (mode_switch.checked) {
            navbar.className = 'navbar navbar-dark sticky-top navbar-expand-md';
            navbar.setAttribute('style', 'background-color: #122023');
            mode_switch_label.setAttribute('style', 'color: white;');
            body.setAttribute('style', 'background-color: #2E5259;');
            all_content_div.setAttribute('style', 'color: white;');
            footer.setAttribute('style', 'background-color: #122023; color: white;');
            github_black.style.display = 'none';
            linkedin_black.style.display = 'none';
            github_white.style.display = 'block';
            linkedin_white.style.display = 'block';
            terms_and_conditions_button.setAttribute('style', 'color: white;')
            // null checks, otherwise an error that might occur stops the execution of the following lines
            if (download_button) {
                download_button.className = 'btn btn-outline-light';
            }
            if (next_button) {
                next_button.className = 'btn btn-outline-light';
            }
            if (previous_button) {
                previous_button.className = 'btn btn-outline-light';
            }
            if (email_submit_button) {
                email_submit_button.className = 'btn btn-outline-light';
            }
            if (see_modal_again_button) {
                see_modal_again_button.className = 'btn btn-outline-light';
            }
            if (accordion) {
                accordion_header_1.style.backgroundColor = '#122023';
                accordion_header_1.style.color = 'white';
                accordion_header_1.style.borderRadius = '0.375rem';
                accordion_button_1.style.backgroundColor = '#122023';
                accordion_button_1.style.color = 'white';
                accordion_body_1.style.backgroundColor = '#122023';
                accordion_body_1.style.color = 'white';
                accordion_item_1.style.border = '1px solid white';

                accordion_header_2.style.backgroundColor = '#122023';
                accordion_header_2.style.color = 'white';
                accordion_header_2.style.borderRadius = '0.375rem';
                accordion_button_2.style.backgroundColor = '#122023';
                accordion_button_2.style.color = 'white';
                accordion_body_2.style.backgroundColor = '#122023';
                accordion_body_2.style.color = 'white';
                accordion_item_2.style.border = '1px solid white';

                accordion_header_3.style.backgroundColor = '#122023';
                accordion_header_3.style.color = 'white';
                accordion_header_3.style.borderRadius = '0.375rem';
                accordion_button_3.style.backgroundColor = '#122023';
                accordion_button_3.style.color = 'white';
                accordion_body_3.style.backgroundColor = '#122023';
                accordion_body_3.style.color = 'white';
                accordion_item_3.style.border = '1px solid white';
            }
            if (navlink) {
                navlink.forEach(element => {
                    element.classList.add('dark');
                });
            }
            if (toast_header) {
                toast_header.forEach(element => {
                    element.classList.add('dark');
                });
            }
            if (toast_body) {
                toast_body.forEach(element => {
                    element.classList.add('dark-toast');
                }) 
            }
        } else {
            navbar.className = 'navbar sticky-top navbar-expand-md bg-light';
            navbar.removeAttribute('style');
            mode_switch_label.removeAttribute('style');
            body.removeAttribute('style');
            all_content_div.removeAttribute('style');
            footer.removeAttribute('style');
            footer.setAttribute('style', 'background-color: #F8F9FA; color: black;')
            github_black.style.display = 'block';
            linkedin_black.style.display = 'block';
            github_white.style.display = 'none';
            linkedin_white.style.display = 'none';
            terms_and_conditions_button.setAttribute('style', 'color: black;');
            if (download_button) {
                download_button.className = 'btn btn-outline-dark'; 
            }
            if (next_button) {
                next_button.className = 'btn btn-outline-dark';
            } 
            if (previous_button) {
                previous_button.className = 'btn btn-outline-dark';
            }
            if (email_submit_button) {
                email_submit_button.className = 'btn btn-outline-dark';  
            }     
            if (see_modal_again_button) {
                see_modal_again_button.className = 'btn btn-outline-dark';
            }
            if (accordion) {
                accordion_header_1.removeAttribute('style');
                accordion_button_1.removeAttribute('style');
                accordion_body_1.removeAttribute('style');
                accordion_item_1.removeAttribute('style');

                accordion_header_2.removeAttribute('style');
                accordion_button_2.removeAttribute('style');
                accordion_body_2.removeAttribute('style');
                accordion_item_2.removeAttribute('style');

                accordion_header_3.removeAttribute('style');
                accordion_button_3.removeAttribute('style');
                accordion_body_3.removeAttribute('style');
                accordion_item_3.removeAttribute('style');
            }
            if (navlink) {
                navlink.forEach(element => {
                    element.classList.remove('dark');
                });
            }
            if (toast_header) {
                toast_header.forEach(element => {
                    element.classList.remove('dark');
                });
            }
            if (toast_body) {
                toast_body.forEach(element => {
                    element.classList.remove('dark-toast');
                }) 
            }
        }
    }

    // This function loads an error page when it is called. At the moment it only fires when throttling is triggered.
    function load_error_page(status_code, header, error_message) {
        fetch(`/error/${header}/${error_message}/${status_code}`)
        .then( () => {
            // adapted from https://www.w3schools.com/js/js_window_location.asp
            window.location.href = `/error/${header}/${error_message}/${status_code}`;
        })
    }

    // creates conditions for displayin' each of the sections
    function set_scene(page_name) {
        navbar.style.display = 'block';

        if (page_name === "home") {
            // set the home button as active
            home_nav.className = 'nav-link active';
            home_nav.setAttribute('aria-current', 'page');
            // set all other buttons as inactive
            about_me_nav.className = 'nav-link';
            about_me_nav.removeAttribute('aria-current');
            projects_nav.className = 'nav-link';
            projects_nav.removeAttribute('aria-current');
            contact_nav.className = 'nav-link';
            contact_nav.removeAttribute('aria-current');
            blog_nav.className = 'nav-link';
            blog_nav.removeAttribute('aria-current');

            // hide all divs and display the correct one
            message_div.style.display = 'none';
            home_div.style.display = 'block';
            about_me_div.style.display = 'none';
            projects_div.style.display = 'none';
            blog_div.style.display = 'none';
            contact_div.style.display = 'none';
            terms_and_conditions_div.style.display = 'none';
        } else if (page_name === "about_me") {
            // set the home button as active
            about_me_nav.className = 'nav-link active';
            about_me_nav.setAttribute('aria-current', 'page');
            // set all other buttons as inactive
            home_nav.className = 'nav-link';
            home_nav.removeAttribute('aria-current');
            projects_nav.className = 'nav-link';
            projects_nav.removeAttribute('aria-current');
            contact_nav.className = 'nav-link';
            contact_nav.removeAttribute('aria-current');
            blog_nav.className = 'nav-link';
            blog_nav.removeAttribute('aria-current');

            // hide all divs and display the correct one
            message_div.style.display = 'none';
            home_div.style.display = 'none';
            about_me_div.style.display = 'block';
            projects_div.style.display = 'none';
            blog_div.style.display = 'none';
            contact_div.style.display = 'none';
            terms_and_conditions_div.style.display = 'none';
        } else if (page_name === "projects") {
            // set the home button as active
            projects_nav.className = 'nav-link active';
            projects_nav.setAttribute('aria-current', 'page');
            // set all other buttons as inactive
            about_me_nav.className = 'nav-link';
            about_me_nav.removeAttribute('aria-current');
            home_nav.className = 'nav-link';
            home_nav.removeAttribute('aria-current');
            contact_nav.className = 'nav-link';
            contact_nav.removeAttribute('aria-current');
            blog_nav.className = 'nav-link';
            blog_nav.removeAttribute('aria-current');

            // hide all divs and display the correct one
            message_div.style.display = 'none';
            home_div.style.display = 'none';
            about_me_div.style.display = 'none';
            projects_div.style.display = 'block';
            blog_div.style.display = 'none';
            contact_div.style.display = 'none';
            terms_and_conditions_div.style.display = 'none';
        } else if (page_name === "blog") {
            // set the home button as active
            blog_nav.className = 'nav-link active';
            blog_nav.setAttribute('aria-current', 'page');
            // set all other buttons as inactive
            about_me_nav.className = 'nav-link';
            about_me_nav.removeAttribute('aria-current');
            home_nav.className = 'nav-link';
            home_nav.removeAttribute('aria-current');
            contact_nav.className = 'nav-link';
            contact_nav.removeAttribute('aria-current');
            projects_nav.className = 'nav-link';
            projects_nav.removeAttribute('aria-current');

            // hide all divs and display the correct one
            message_div.style.display = 'none';
            home_div.style.display = 'none';
            about_me_div.style.display = 'none';
            projects_div.style.display = 'none';
            blog_div.style.display = 'block';
            contact_div.style.display = 'none';
            terms_and_conditions_div.style.display = 'none';
        } else if (page_name === "contact") {
             // set the home button as active
            contact_nav.className = 'nav-link active';
            contact_nav.setAttribute('aria-current', 'page');
            // set all other buttons as inactive
            about_me_nav.className = 'nav-link';
            about_me_nav.removeAttribute('aria-current');
            projects_nav.className = 'nav-link';
            projects_nav.removeAttribute('aria-current');
            home_nav.className = 'nav-link';
            home_nav.removeAttribute('aria-current');
            blog_nav.className = 'nav-link';
            blog_nav.removeAttribute('aria-current');

            // hide all divs and display the correct one
            message_div.style.display = 'none';
            home_div.style.display = 'none';
            about_me_div.style.display = 'none';
            projects_div.style.display = 'none';
            blog_div.style.display = 'none';
            contact_div.style.display = 'block';
            terms_and_conditions_div.style.display = 'none';

        } else if (page_name === 'terms_and_conditions') {
             // set all buttons as inactive since this displays something else
             contact_nav.className = 'nav-link';
             contact_nav.removeAttribute('aria-current');
             about_me_nav.className = 'nav-link';
             about_me_nav.removeAttribute('aria-current');
             projects_nav.className = 'nav-link';
             projects_nav.removeAttribute('aria-current');
             home_nav.className = 'nav-link';
             home_nav.removeAttribute('aria-current');
             blog_nav.className = 'nav-link';
             blog_nav.removeAttribute('aria-current');

             message_div.style.display = 'none';
             home_div.style.display = 'none';
             about_me_div.style.display = 'none';
             projects_div.style.display = 'none';
             blog_div.style.display = 'none';
             contact_div.style.display = 'none';
             terms_and_conditions_div.style.display = 'block';
        }

        // clear out all divs
        message_div.innerHTML = '';
        home_div.innerHTML = '';
        about_me_div.innerHTML = '';
        projects_div.innerHTML = '';
        contact_div.innerHTML = '';
        blog_div.innerHTML = '';
        terms_and_conditions_div.innerHTML = '';

        // if page_name === terms and conditions -> do not append the google analytics tag and do not show cookie modal
        if (page_name === 'terms_and_conditions') {
            // this is for logic purposes only. This does nothing.

        // else: fetch from an api endpoint - whether this client has a valid cookie - it will 
        // return true or false and whether the user agreed to cookies
        } else {
            fetch('get_cookie_preferences')
            .then(response => response.json())
            .then(data => {
                const ga4_div = document.querySelector('#ga4');
                ga4_div.innerHTML = '';
                if (data[0]) {
                    if (data[0].ga4_agreement === true) {
                        // if there is a cookie and the user agreed to cookies
                        // set the GA4 tags
                        ga4_div.innerHTML = '<!-- Google tag (gtag.js) --><script async src="https://www.googletagmanager.com/gtag/js?id=G-Z8HZW1TDNH"></script><script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag("js", new Date());gtag("config", "G-Z8HZW1TDNH");</script>'
                    } else if (data[0].ga4_agreement === false) {
                        // if there is a cookie and the user did not agree to cookies
                        // do not set GA4
                        ga4_div.innerHTML = '';
                    }
                } else if (data.not_found){
                    show_modal();
                }
            })
            .catch(error => {
                console.error(error);
                frontend_error_log(error);
            });

        }
    }

    // makes a fetch request to the backend to log the frontend error into logs
    function frontend_error_log(error_message) {
        fetch(`/frontend_error`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrf_token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'error_message': error_message,
            })
        })
        .then(response => response.json())
        .then(data => {
            if (!(data.success)) {
                if (data.unauthorized) {
                    console.log(data.unauthorized)
                } else {
                    console.log(data.error)
                }
            }
        })
        // no catch here since this is the logging function
    }

    // Displays a bootstrap toast with a success or error message
    function show_message(subject, text) {
        console.log(`Message: ${subject}: ${text}`);
        // adapted from official bootstrap documentation: https://getbootstrap.com/docs/5.2/components/toasts/
        message_div.innerHTML = '';
        message_div.style.display = 'block';
        

        const toast_container = document.createElement('div');
        toast_container.className = 'toast-container position-fixed bottom-0 end-0 p-3';

        const live_toast = document.createElement('div');
        live_toast.id = 'liveToast';
        live_toast.className = 'toast';
        live_toast.role = 'alert';
        live_toast.setAttribute('aria-live', 'assertive');
        live_toast.setAttribute('aria-atomic', true);

        const toast_header = document.createElement('div');
        toast_header.className = 'toast-header';
        const toast_header_text = document.createElement('strong');
        toast_header_text.className = 'me-auto';
        toast_header_text.textContent = subject.charAt(0).toUpperCase() + subject.slice(1);
        const toast_header_close = document.createElement('button');
        toast_header_close.type = 'button';
        toast_header_close.className = 'btn-close';
        toast_header_close.setAttribute('data-bs-dismiss', 'toast');
        toast_header_close.setAttribute('aria-label', 'Close');
        toast_header.append(toast_header_text, toast_header_close);

        const toast_body = document.createElement('div');
        toast_body.className = 'toast-body';
        const toast_body_text = document.createElement('p');
        toast_body_text.id = 'toast_body_text';
        toast_body_text.textContent = text;
        toast_body.append(toast_body_text);

        live_toast.append(toast_header, toast_body);
        toast_container.append(live_toast);
        message_div.append(toast_container);

        const toast = new bootstrap.Toast(live_toast);

        if (mode_switch.checked) {
            toast_header.classList.add('dark-toast');
            toast_body.classList.add('dark-toast');

        }

        toast.show();
    }

    // Displays a bootstrap modal with cookie consent
    function show_modal() {
        //adapted from official bootstrap documentation: https://getbootstrap.com/docs/5.2/components/modal/
        message_div.innerHTML = '';
        message_div.style.display = 'block';

        const staticBackdrop = document.createElement('div');
        staticBackdrop.className = 'modal fade';
        staticBackdrop.id = 'staticBackdrop';
        staticBackdrop.setAttribute('data-bs-backdrop', 'static');
        staticBackdrop.setAttribute('data-bs-keyboard', 'false');
        

        const modal_dialog_div = document.createElement('div');
        modal_dialog_div.className = 'modal-dialog';
        staticBackdrop.append(modal_dialog_div);

        const modal_content_div = document.createElement('div');
        modal_content_div.className = 'modal-content';
        if (mode_switch.checked) {
            modal_content_div.style.backgroundColor = '#122023';
            modal_content_div.style.color = 'white';
        }

        const modal_header = document.createElement('div');
        modal_header.className = 'modal-header';

        const modal_title = document.createElement('h2');
        modal_title.className = 'modal-title fs-5';
        modal_title.id = 'staticBackdropLabel';
        modal_title.textContent = 'Cookie preferences';
        const modal_close_btn_1 = document.createElement('button');
        modal_close_btn_1.type = 'button';
        modal_close_btn_1.className = 'btn-close';
        modal_close_btn_1.setAttribute('data-bs-dismiss', 'modal');
        modal_close_btn_1.setAttribute('aria-label', 'Close');
        modal_header.append(modal_title);

        const modal_body = document.createElement('div');
        modal_body.className = 'modal-body';
        
        const modal_body_text = document.createElement('p');
        modal_body_text.id = 'modal_body_text';
        modal_body_text.textContent = 'This site uses cookies to enhance your experience, provide personalized content, and analyze traffic. You can adjust your preferences below to control how cookies are used. Some cookies are necessary for the proper functioning of the site, and others help us improve your experience. Your choices will be saved and can be updated at any time from the Terms and Conditions.';
        modal_body.append(modal_body_text);

        // sliders to agree to ga4, necessarry cookies have a disabled slider
        const necessarry_cookies_button_div = document.createElement('div');
        necessarry_cookies_button_div.className = 'ms-auto d-flex align-items-center';
        const necessarry_cookies_button_form = document.createElement('form');
        necessarry_cookies_button_form.className = 'form-check form-switch mb-0';
        const necessarry_cookies_button_label = document.createElement('label');
        necessarry_cookies_button_label.className = 'form-check-label';
        necessarry_cookies_button_label.id = 'necessarry_cookies_button_label';
        necessarry_cookies_button_label.setAttribute('for', 'necessarry_cookies_switch_button');
        necessarry_cookies_button_label.textContent = 'Necessarry cookies';
        const necessarry_cookies_switch_button = document.createElement('input');
        necessarry_cookies_switch_button.id = 'necessarry_cookies_switch_button';
        necessarry_cookies_switch_button.className = 'form-check-input';
        necessarry_cookies_switch_button.type = 'checkbox';
        necessarry_cookies_switch_button.role = 'switch';
        necessarry_cookies_switch_button.setAttribute('disabled', '');
        necessarry_cookies_switch_button.setAttribute('checked', '');
        necessarry_cookies_button_form.append(necessarry_cookies_button_label, necessarry_cookies_switch_button)
        necessarry_cookies_button_div.append(necessarry_cookies_button_form);
        modal_body.append(necessarry_cookies_button_div);

        const ga4_div = document.createElement('div');
        ga4_div.className = 'ms-auto d-flex align-items-center';
        const ga4_form = document.createElement('form');
        ga4_form.className = 'form-check form-switch mb-0';
        const ga4_label = document.createElement('label');
        ga4_label.className = 'form-check-label';
        ga4_label.id = 'ga4_button_label';
        ga4_label.setAttribute('for', 'ga4_switch_button');
        ga4_label.textContent = 'Google Analytics cookies';
        const ga4_switch_button = document.createElement('input');
        ga4_switch_button.id = 'ga4_switch_button';
        ga4_switch_button.className = 'form-check-input';
        ga4_switch_button.type = 'checkbox';
        ga4_switch_button.role = 'switch';
        ga4_form.append(ga4_label, ga4_switch_button)
        ga4_div.append(ga4_form);
        modal_body.append(ga4_div);

        // button to show terms and conditions
        const terms_and_conditions_modal_button = document.createElement('button');
        terms_and_conditions_modal_button.id = 'terms_and_conditions_modal_button';
        terms_and_conditions_modal_button.textContent = 'Terms and Conditions';
        if (mode_switch.checked) {
            terms_and_conditions_modal_button.style.color = 'white';
        }
        modal_body.append(terms_and_conditions_modal_button);

        // Allows the user to read the terms and conditions before they agree to it. 
        // Also, no GA4 is ever applied in the terms and conditions section
        terms_and_conditions_modal_button.addEventListener('click', function(event) {
            event.preventDefault();
            show_terms_and_conditions();
            new_modal.hide();
        })


        const modal_footer = document.createElement('div');
        modal_footer.className = 'modal-footer';

        const modal_dismiss_button = document.createElement('button');
        modal_dismiss_button.type = 'button';
        modal_dismiss_button.className = 'btn btn-secondary';
        modal_dismiss_button.setAttribute('data-bs-dismiss', 'modal');
        modal_dismiss_button.textContent = 'Close';
        const modal_agree_button = document.createElement('button');
        modal_agree_button.type = 'button';
        if (mode_switch.checked) {
            modal_agree_button.className = 'btn btn-outline-light';
        } else {
            modal_agree_button.className = 'btn btn-outline-dark';
        }
        modal_agree_button.textContent = 'Save my preferences';
        modal_footer.append(modal_agree_button);

        modal_agree_button.addEventListener('click', function(event) {
            event.preventDefault();
            let ga4_value = false;

            if (ga4_switch_button.checked) {
                ga4_value = true;
            }

            // send a post request to save the settings
            fetch('/set_cookie_preferences', {
                method: 'POST',
                    headers: {
                        'X-CSRFToken': csrf_token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                    'ga4_consent': ga4_value,
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    show_message('Success', data.success);
                } else if (data.error) {
                    show_message('Error', data.error);
                } else if (data.critical) {
                    show_message('Critical error', data.critical);
                } else {
                    show_message('Unauthorized', data.unauthorized);
                }
                // hide the modal
                new_modal.hide();
                
            })
            .then(show_home)
            .catch(error => {
                console.error(error);
                frontend_error_log(error);
            });
            
        })

        modal_content_div.append(modal_header, modal_body, modal_footer);
        modal_dialog_div.append(modal_content_div);
        message_div.append(staticBackdrop);

        // showing the modal according to bootstraps documentation
        const new_modal = new bootstrap.Modal(staticBackdrop, {
            backdrop: "static",
            keyboard: false,
        });
        new_modal.show();
    }

    // displays the section with terms and conditions
    function show_terms_and_conditions() {
        set_scene('terms_and_conditions');

        // retrieve terms and conditions content from an API endpoint
        fetch('get_terms_and_conditions_content')
        .then(response => {
            if (response.status === 429) {
                load_error_page(429, 'Too many requests', "You have made too many requests. Please try again tomorrow.");
                return null;
            } else {
                return response.json();
            }
        })        .then(data => {
            // transform the content from markdwon to HTML
            // Append the content to the appropriate div
            terms_and_conditions_div.innerHTML = converter.makeHtml(data)

            // add a button that will once again trigger the consent modal so that the user can change his consent
            const see_modal_again = document.createElement('button');
            see_modal_again.id = 'see_modal_again_button';
            see_modal_again.textContent = 'Change my cookie preferences';
            if (mode_switch.checked) {
                see_modal_again.className = 'btn btn-outline-light';
            } else {
                see_modal_again.className = 'btn btn-outline-dark';
            }
            terms_and_conditions_div.append(see_modal_again);

            see_modal_again.addEventListener('click', function(event) {
                event.preventDefault();
                show_modal();
                // This may turn out to be insufficient in the future as I am not sure how the downloaded GA4 cookie reacts
                // when the consent is revoked. Might have to work on actually removing the tracking cookie.
            })
        })
        .catch(error => {
            console.error(error);
            frontend_error_log(error);
        })
    }

    // checks for the dark mode setting in the database in corelation with the session cookie 
    function check_dark_mode() {
        // this function allows the darkmode to be persistent within a sessions duration for each reload of the page.
        fetch('/get_darkmode_preference')
        .then(response => response.json())
        .then(data => {
            if (data.darkmode === true){
                mode_switch.click()
            } else {
                // nothing
            }
        })
    }
})