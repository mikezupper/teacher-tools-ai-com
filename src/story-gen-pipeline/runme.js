// runme.js - REVISED: Educational-focused demo showcasing improved pipeline

import { runPipeline } from "./index.js";
import {generateRandomStoryInput} from "./randomizer.js";

const abort = new AbortController();

try {
    console.log("🎓 Starting EDUCATIONAL story generation pipeline...\n");

    const inputParams = await generateRandomStoryInput({
        // gradeLevel: '3',
        // complexityLevel: 'balanced'
    });

    console.log("✅ Random parameters generated:");
    console.log(`   Theme: ${inputParams.theme}`);
    console.log(`   Genre: ${inputParams.genre}`);
    console.log(`   Phonics: ${inputParams.phonicSkill}`);
    console.log(`   Length: ${inputParams.length} sentences`);

    // Educational-focused pipeline options
    const options = {
        qualityThreshold: 0.75,
        maxRevisionCycles: 2,
        strictPhonics: true,
        educationalFocus: true,
        signal: abort.signal
    };

    console.log("⚙️ PIPELINE CONFIGURATION:");
    console.log(`   Educational Quality Threshold: ${options.qualityThreshold}`);
    console.log(`   Maximum Revision Cycles: ${options.maxRevisionCycles}`);
    console.log(`   Strict Phonics Enforcement: ${options.strictPhonics}`);
    console.log(`   Education-First Approach: ${options.educationalFocus}`);
    console.log("");

    const startTime = performance.now();
    const story = await runPipeline(inputParams, options);
    const endTime = performance.now();

    // Display the educational story
    console.log("\n" + "=".repeat(80));
    console.log(`📖 EDUCATIONAL STORY: "${story.title}"`);
    console.log("=".repeat(80));

    if (story.paragraphs && story.paragraphs.length > 0) {
        story.paragraphs.forEach((paragraph, pIdx) => {
            console.log(`\nParagraph ${pIdx + 1}:`);
            if (paragraph.sentences) {
                paragraph.sentences.forEach((sentenceObj, sIdx) => {
                    const sentence = sentenceObj.sentence || sentenceObj;
                    // Fix: Remove punctuation before counting
                    const wordCount = sentence.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0).length;
                    const phonicsWords = sentenceObj.phonicsWords || [];
                    const phonicsDisplay = phonicsWords.length > 0 ? ` [${phonicsWords.join(', ')}]` : '';
                    console.log(`  ${sIdx + 1}. [${wordCount}w] ${sentence}${phonicsDisplay}`);
                });
            }
        });
    }

    // Educational Analysis Report
    console.log("\n" + "=".repeat(80));
    console.log("🎯 EDUCATIONAL EFFECTIVENESS REPORT");
    console.log("=".repeat(80));

    if (story.finalReport) {
        const report = story.finalReport;

        console.log(`\n📊 OVERALL ASSESSMENT: ${report.overallAssessment}`);
        console.log(`   Educational Score: ${report.overallScore}/1.000`);
        console.log(`   Meets Threshold: ${report.meetsThreshold ? '✅ YES' : '❌ NO'}`);
        console.log(`   Ready for Instruction: ${report.summary.readyForInstruction ? '✅ YES' : '⚠️ NEEDS REVIEW'}`);

        console.log(`\n📈 EDUCATIONAL COMPONENT SCORES:`);
        const scores = report.qualityBreakdown;
        console.log(`   Developmental Appropriateness: ${(scores.developmentalAppropriateness || 0).toFixed(3)}`);
        console.log(`   Phonics Integration:           ${(scores.phonicsIntegration || 0).toFixed(3)}`);
        console.log(`   Story Quality:                 ${(scores.storyQuality || 0).toFixed(3)}`);
        console.log(`   Instructional Readiness:       ${(scores.instructionalReadiness || 0).toFixed(3)}`);

        console.log(`\n🔤 PHONICS ANALYSIS:`);
        console.log(`   Target Pattern: ${report.summary.phonicsPattern}`);
        console.log(`   Words Found: ${report.summary.phonicsWords}`);
        console.log(`   Pattern Distribution: ${story.educationalAnalysis?.phonics?.effectiveness || 'unknown'}`);

        if (report.educationalStrengths && report.educationalStrengths.length > 0) {
            console.log(`\n✅ EDUCATIONAL STRENGTHS:`);
            report.educationalStrengths.forEach(strength => {
                console.log(`   • ${strength}`);
            });
        }

        if (report.criticalIssues && report.criticalIssues.length > 0) {
            console.log(`\n⚠️ AREAS FOR IMPROVEMENT:`);
            report.criticalIssues.forEach(issue => {
                console.log(`   • ${issue}`);
            });
        }

        if (report.recommendations && report.recommendations.length > 0) {
            console.log(`\n💡 EDUCATIONAL RECOMMENDATIONS:`);
            report.recommendations.forEach(rec => {
                console.log(`   • ${rec}`);
            });
        }

        console.log(`\n👩‍🏫 RECOMMENDED USE: ${report.summary.recommendedUse || 'Review needed'}`);
    }

    // Technical Performance Summary
    console.log("\n" + "=".repeat(80));
    console.log("⚡ PIPELINE PERFORMANCE");
    console.log("=".repeat(80));

    const processingTime = Math.round(endTime - startTime);
    const revisionCycles = story.pipeline?.revisionCycles || 0;

    console.log(`Processing Time: ${processingTime}ms`);
    console.log(`Revision Cycles Used: ${revisionCycles}/${options.maxRevisionCycles}`);
    console.log(`Total Sentences Generated: ${story.finalReport?.summary?.totalSentences || 0}`);
    console.log(`Phonics Words Integrated: ${story.finalReport?.summary?.phonicsWords || 0}`);

    // Detailed sentence analysis (if available)
    if (story.pipeline?.finalEvaluation?.sentenceAnalysis) {
        console.log("\n📝 SENTENCE-BY-SENTENCE ANALYSIS:");
        story.pipeline.finalEvaluation.sentenceAnalysis.forEach((analysis, idx) => {
            const status = analysis.issues && analysis.issues.length > 0 ? '⚠️' : '✅';
            console.log(`   ${status} Sentence ${idx + 1}: ${analysis.wordCount} words`);
            if (analysis.issues && analysis.issues.length > 0) {
                analysis.issues.forEach(issue => {
                    console.log(`      Issue: ${issue}`);
                });
            }
        });
    }

    // Success/Warning Summary
    const isEducationallySound = story.finalReport?.meetsThreshold &&
        story.finalReport?.summary?.readyForInstruction;

    console.log(`\n${isEducationallySound ? '🎉' : '⚠️'} EDUCATIONAL PIPELINE RESULT: ${isEducationallySound ? 'READY FOR CLASSROOM' : 'NEEDS EDUCATOR REVIEW'}`);

    if (isEducationallySound) {
        console.log("   ✅ Story meets educational quality standards");
        console.log("   ✅ Phonics integration is educationally sound");
        console.log("   ✅ Grade-level appropriateness confirmed");
        console.log("   ✅ Ready for classroom implementation");

        if (story.educationalAnalysis?.instructional?.teacherNotes) {
            console.log(`\n📋 TEACHER NOTES: ${story.educationalAnalysis.instructional.teacherNotes}`);
        }

        if (story.educationalAnalysis?.instructional?.extensionActivities) {
            console.log(`\n🎯 SUGGESTED ACTIVITIES:`);
            story.educationalAnalysis.instructional.extensionActivities.forEach(activity => {
                console.log(`   • ${activity}`);
            });
        }
    } else {
        console.log("   📝 Story generated but requires educator review");
        console.log("   💡 Consider adjusting parameters or reviewing recommendations");
        console.log("   🔄 May benefit from manual refinement for classroom use");
    }

    // Research Alignment Summary
    console.log("\n" + "=".repeat(40));
    console.log("📚 RESEARCH ALIGNMENT SUMMARY");
    console.log("=".repeat(40));

    console.log(`Grade Level Target: Grade ${inputParams.gradeLevel}`);
    console.log(`Developmental Appropriateness: ${story.educationalAnalysis?.gradeLevel?.developmentalAlignment || 'unknown'}`);
    console.log(`Phonics Educational Value: ${story.educationalAnalysis?.phonics?.educationalValue || 'unknown'}`);
    console.log(`Classroom Readiness: ${story.educationalAnalysis?.instructional?.classroomReady ? 'Ready' : 'Needs Review'}`);

    if (story.educationalAnalysis?.gradeLevel?.readabilityScore) {
        console.log(`Estimated Readability Score: ${story.educationalAnalysis.gradeLevel.readabilityScore}`);
    }

} catch (error) {
    console.error("\n❌ EDUCATIONAL PIPELINE FAILURE:");
    console.error("=".repeat(40));
    console.error(`Error Type: ${error.name || 'Unknown Error'}`);
    console.error(`Message: ${error.message}`);

    if (error.stack) {
        console.error(`\nStack Trace:`);
        console.error(error.stack);
    }

    console.log("\n🔧 TROUBLESHOOTING GUIDE:");
    console.log("   1. Verify API credentials are properly configured in .env");
    console.log("   2. Check internet connectivity and API endpoint accessibility");
    console.log("   3. Ensure input parameters meet educational requirements");
    console.log("   4. Try reducing quality threshold if standards are too strict");
    console.log("   5. Verify grade level and phonics skill are properly specified");
    console.log("   6. Check for sufficient API rate limits and quotas");

    console.log("\n💡 EDUCATIONAL PARAMETER SUGGESTIONS:");
    console.log("   • Use grade levels K-6 for best results");
    console.log("   • Specify clear phonics patterns (e.g., 'sh digraph', 'long a')");
    console.log("   • Keep story length appropriate for grade level");
    console.log("   • Ensure themes are age-appropriate and engaging");

    process.exit(1);
}
