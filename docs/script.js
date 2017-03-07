$( document ).ready(function() {
    /**
     * Nav Functionality
     */
    $("#nav a").click(function(e) {
        var href = $(this).attr("href");
        e.preventDefault();
        if (href == "#home") {
            $("html, body").animate({
                scrollTop: $("#app").offset().top - 50
            }, 'slow');
        } else if (href != "#") {
            $("html, body").animate({
                scrollTop: $(href).offset().top - 50
            }, 'slow');
        }
    });


    /**
     * Initialize Simple MD Editor
     */
    var simplemde = new SimpleMDE({ 
        element: $("#readme-edit")[0],
        autosave: true,
        spellChecker: false,
        placeholder: "Give a top-level desciption of your study here..."
    });



    /**
     * Project Title Interactivity
     */
    var projectTitle = "My Project Title <span>(Click to edit...)</span>";
    $("#project-title")
        .html(projectTitle)
        .promise().done(function() {
            projectTitle = "My Project Title";
        });
    $("h2[contenteditable]").on('blur keyup paste', function() {
        projectTitle = $(this).text();
    });


    /**
     * Project Options Configuration
     */
    var components = { "" : "" };
    function addComponent() {
        var component = $("#new-component input").val();
        if (component != "") {
            components[component] = component;
        }
    };

    $("#new-component input").on('keyup', function(e) {
        if (e.keyCode==13) {
            addComponent();
        }
    });
    $("#new-component span").on('click', function(e) {
        addComponent();
    });



    /**
     * File Download Specification
     */    
    var readme = {};
    $("#download").click(function() {
        // Called when 'Download' Button Clicked
        simplemde.togglePreview();
        projectFolder = projectTitle + ".zip";

        readme.md = simplemde.value();
        readme.html = $(".editor-preview").first().html();
        readme.txt = readme.html.replace(/<(?:.|\n)*?>/gm, '');

        /**
         * Current Structure:
         *     ProjectTitle/
         *     ├── README.txt
         *     ├── README.md
         *     ├── README.html
         *     ├── About
         *     ├── AnalysisPlans/
         *     │   └── AimN/
         *     ├── SummaryReports/
         *     │   └── AudienceN/
         *     └── Data/
         *         └── Module_X/
         *             ├── Collection/
         *             │   └── TimeN/
         *             ├── Entry/
         *             │   └── TimeN/
         *             └── Programs/
         *                 └── TimeN/
         */
        var root = new JSZip();
        root.file("README.txt", readme.txt);
        root.file("README.md", readme.md);
        root.file("README.html", readme.html);
        root.file("README.docx", "foo bar");

        var plan = root.folder("AnalysisPlans");
        plan.file("Aim_N/README.txt", "Describe the analysis aim here");
        plan.file("Aim_N/README.md", "# Describe the analysis aim here");
        plan.file("Aim_N/README.html", "<h1>Describe the analysis aim here</h1>");

        var reports = root.folder("Summary_Reports");
        reports.folder("Papers");
        reports.folder("Other");

        var data = root.folder("Data");


        root.generateAsync({type: "blob"})
            .then(function(content) {
                saveAs(content, projectFolder)
            })
            .then(function() {
                simplemde.togglePreview();      
            });  
    });

});