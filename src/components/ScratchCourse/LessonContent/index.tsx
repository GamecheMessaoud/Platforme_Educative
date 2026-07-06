import React from 'react';
import type { Lesson, VerificationResult } from '../../../types';
import LessonHeader from './LessonHeader';
import ConceptsSection from './ConceptsSection';
import BlocksSection from './BlocksSection';
import EditorSection from './EditorSection';
import ChallengeSection from './ChallengeSection';
import VerificationSection from './VerificationSection';
import FileSubmissionSection from './FileSubmissionSection';
import NavigationButtons from './NavigationButtons';
import YoutubeSection from './YoutubeSection';
import GuideSection from './GuideSection';
import LabSection from './LabSection';
import QcmSection from './QcmSection';

interface props {
    lesson: Lesson;
    isCompleted: boolean;
    onVerified: (result: VerificationResult) => void;
    onPrevious: () => void;
    onNext: () => void;
    hasPrevious: boolean;
    hasNext: boolean;
    isNextDisabled: boolean;
}

const LessonContent: React.FC<props> = ({
    lesson,
    isCompleted,
    onVerified,
    onPrevious,
    onNext,
    hasPrevious,
    hasNext,
    isNextDisabled
}) => {
    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in py-8">
            <LessonHeader lesson={lesson} />

            {lesson.youtube_url && <YoutubeSection videoUrl={lesson.youtube_url} />}

            {lesson.guide_content && <GuideSection content={lesson.guide_content} />}

            {lesson.lab_url && <LabSection labUrl={lesson.lab_url} />}

            {lesson.extra_qcm && <QcmSection qcmData={lesson.extra_qcm} />}

            {lesson.concepts && lesson.concepts.length > 0 && (
                <ConceptsSection concepts={lesson.concepts} />
            )}

            {lesson.blocks && lesson.blocks.length > 0 && (
                <BlocksSection blocks={lesson.blocks} />
            )}

            {lesson.challenge && (
                <ChallengeSection challenge={lesson.challenge} hints={lesson.hints} />
            )}

            <EditorSection />

            <VerificationSection
                lesson={lesson}
                onVerified={onVerified}
                isCompleted={isCompleted}
            />

            {/* File Submission Section for final project - show on last lesson, or explicitly allow on all for practice */}
            <FileSubmissionSection lessonId={lesson.id} />

            <NavigationButtons
                onPrevious={onPrevious}
                onNext={onNext}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                isNextDisabled={isNextDisabled}
            />
        </div>
    );
};

export default LessonContent;
