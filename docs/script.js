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
    var defaultTitle = projectTitle;
    $("#project-title")
        .html(projectTitle)
        .promise().done(function() {
            projectTitle = "My Project Title";
        });
    $("h2[contenteditable]").on('blur keyup paste', function() {
        projectTitle = $(this).html() == defaultTitle ? "My Project Title" : $(this).text();
    });

    /**
     * Checklist Requirement
     */
    $("#checklist input[type='checkbox']").click(function(){
        $(this).next().toggleClass('strikethrough');
        nBoxes = $("#checklist input[type='checkbox']").length;
        nChecks = $("#checklist input[type='checkbox']:checked").length;
        if (nChecks == nBoxes) {
            $("#download a").removeClass('disallow');
        } else {
            $("#download a").addClass('disallow');
        };
    });


    /**
     * SimpleMDE Customization
     */
    simplemde.codemirror.on("change", function(){
        if (!$("#checklist input#todo-readme").is(':checked')) {
            $("#checklist input#todo-readme").click();
        }
    });
    /**
     * Project Options Configuration
     */
    var components = { "" : "" };
    $("#new-component span").on('click', function(e) {
        var component = $("#new-component input")
                            .val()
                            .replace(/\s/gi, "-");
        if (component != "" && components[component] == undefined) {
            components[component] = component;
            $("<span>")
                .text(component)
                .click(function() {
                    components[component] = null;
                    $(this)
                        .fadeOut()
                        .promise()
                        .done(function(){
                            $(this).remove();
                        });
                })
                .appendTo($("#components-list"));
            $("#new-component input").val("");
            window.components = components;
        };
        if (!$("#checklist input#todo-components").is(':checked')) {
            $("#checklist input#todo-components").click();
        }
    });
    $("#new-component input").on('keyup', function(e) {
        if (e.keyCode==13) {$("#new-component span").click(); };
    });

    var logistics = { "" : "" };
    $("#new-logistic span").on('click', function(e) {
        var logistic = $("#new-logistic input")
                            .val()
                            .replace(/\s/gi, "-");
        if (logistic != "" && logistics[logistic] == undefined) {
            logistics[logistic] = logistic;
            $("<span>")
                .text(logistic)
                .click(function() {
                    logistics[logistic] = null;
                    $(this)
                        .fadeOut()
                        .promise()
                        .done(function(){
                            $(this).remove();
                        });
                })
                .appendTo($("#logistics-list"));
            $("#new-logistic input").val("");
            window.logistics = logistics;
        };
        if (!$("#checklist input#todo-logistics").is(':checked')) {
            $("#checklist input#todo-logistics").click();
        }
    });
    $("#new-logistic input").on('keyup', function(e) {
        if (e.keyCode==13) {$("#new-logistic span").click(); };
    });



    /**
     * File Download Specification
     */    
    var readme = {};
    $("#download a").click(function(event) {
        // Called when 'Download' Button Clicked
        if (!$(this).hasClass('disallow')) {
            download();
        } else {
            event.preventDefault();
        }
    });
    function download() {
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

        var plan = root.folder("AnalysisPlans");
        plan.file("Aim_N/README.txt", "Describe the analysis aim here");
        plan.file("Aim_N/README.md", "# Describe the analysis aim here");
        plan.file("Aim_N/README.html", "<h1>Describe the analysis aim here</h1>");

        var reports = root.folder("Summary_Reports");
        reports.folder("Papers");
        reports.folder("Other");

        var data = root.folder("Data");
        $.map(components, function(c){
            if (c != null && c != "") {
                var module = {};
                module.name = c;
                module.data = data.folder(c);
                module.data.folder("Collection");
                module.data.folder("Entry");
                module.data.folder("Programs");
            }
        });

        var implementation = root.folder("Logistics")
        $.map(logistics, function(l) {
            if (l != null && l != "") {
                implementation.folder(l);
            }
        });

        root.generateAsync({type: "blob"})
            .then(function(content) {
                saveAs(content, projectFolder)
            })
            .then(function() {
                simplemde.togglePreview();      
            });  
    };

});