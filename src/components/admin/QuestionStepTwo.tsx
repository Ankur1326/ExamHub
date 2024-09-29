import React, { useEffect, useState } from 'react'
import SearchDropdown from '../SearchDropdown';
import MultiTagSearchDropdown from '../MultiTagSearchDropdown';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { fetchSkills } from '@/redux/slices/configuration/manage-subjects/skillsSlice';
import { fetchTopics } from '@/redux/slices/configuration/manage-subjects/topicSlice';
import { fetchTags } from '@/redux/slices/configuration/manage-categories/tagsSlice';
import FormInput from '../FormInput';
import { createOrUpdateQuestion } from '@/redux/slices/library/question-bank/questionSlice';
import DifficultyLevel from '../DifficultyLevel';

interface QuestionStepTwoProps {
    questionId: string | null;
    questionData?: any;
    nextStep: () => void;
    prevStep: () => void;
}

function QuestionStepTwo({ questionId, questionData, nextStep, prevStep }: QuestionStepTwoProps) {
    const dispatch = useDispatch<AppDispatch>();

    const [skillName, setSkillName] = useState<string>('');
    const [topicName, setTopicName] = useState<string>('');
    const [tagNames, setTagNames] = useState<any>([]);
    const [difficultyLevel, setDifficultyLevel] = useState<string>("")
    const [defaultMarks, setDefaultMarks] = useState<number>(0);
    const [defaultTimeToSolve, setDefaultTimeToSolve] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(false);

    useEffect(() => {
        setSkillName(questionData?.skillName)
        setTopicName(questionData?.topicName)
        setTagNames(questionData?.tagDetails)
        setDifficultyLevel(questionData?.difficultyLevel)
        setDefaultTimeToSolve(questionData?.defaultTimeToSolve)
        setDefaultMarks(questionData?.defaultMarks)
        setIsActive(questionData?.isActive)
    }, [questionData])

    const fetchAllActiveSkills = async (searchQuery: string, fetchAll: boolean) => {
        const response = await dispatch(fetchSkills({ name: searchQuery, fetchAll, isActive: true }));
        return response.payload.skills || [];
    }

    const fetchAllActiveTopic = async (searchQuery: string, fetchAll: boolean) => {
        const response = await dispatch(fetchTopics({ name: searchQuery, fetchAll, isActive: true }))
        return response.payload.topics || [];
    }

    const fetchAllActiveTags = async (searchQuery: string, fetchAll: boolean) => {
        const response = await dispatch(fetchTags({ name: searchQuery, fetchAll, isActive: true }))
        return response.payload.tags || [];
    }

    const handleTagSelect = (tags: any[]) => {
        setTagNames(tags); // Update the selected tags
    };

    const handleSave = async (e: any) => {
        e.preventDefault()
        const tagNamesArray = tagNames.map((tag: any) => tag.name);
        let resultAction = await dispatch(createOrUpdateQuestion({ step: 2, data: { skillName, difficultyLevel, topicName, tagNames: tagNamesArray, defaultMarks, defaultTimeToSolve, isActive }, questionId }));
        if (resultAction && createOrUpdateQuestion.fulfilled.match(resultAction)) {
            nextStep()
        }
    }

    return (
        <div className="space-y-6 w-full md:w-2/3">
            <form onSubmit={(e) => handleSave(e)}>
                {/* Skill Topic */}
                <SearchDropdown
                    label="Skill Name"
                    placeholder="Search for a skill..."
                    required={true}
                    fetchResults={fetchAllActiveSkills}
                    sectionName={skillName}
                    onSelect={(skill: any) => {
                        setSkillName(skill.name); // Set the selected section
                    }}
                />

                {/* topic */}
                <SearchDropdown
                    label="Topic Name"
                    placeholder="Search for a topic..."
                    required={false}
                    fetchResults={fetchAllActiveTopic}
                    sectionName={topicName}
                    onSelect={(topic: any) => {
                        setTopicName(topic.name); // Set the selected section
                    }}
                />
                {/* tags */}
                <MultiTagSearchDropdown
                    label="Select Tags"
                    placeholder="Select Tags"
                    fetchResults={fetchAllActiveTags}
                    onSelect={handleTagSelect}
                    required={false}
                    selectedTags={tagNames}
                />

                <DifficultyLevel difficulty={difficultyLevel} setDifficulty={setDifficultyLevel} required={true} />
                {/* Time Period */}
                <div className="mt-4">
                    <FormInput
                        label="Default Time (second)"
                        type='number'
                        value={defaultTimeToSolve}
                        onChange={(e) => setDefaultTimeToSolve(Number(e.target.value))}
                        required={true}
                        placeholder='Enter default time to solve the question'
                    />
                </div>
                {/* Default Marks */}
                <div className="mt-4">
                    <FormInput
                        label="Default Marks"
                        type='number'
                        value={defaultMarks}
                        onChange={(e) => setDefaultMarks(Number(e.target.value))}
                        required={true}
                        placeholder='Enter Default Marks'
                    />
                </div>

                {/* Active/Inactive Toggle */}
                <div className="mt-4">
                    <div className='flex items-center'>
                        <label className="mr-2 text-sm font-semibold text-gray-700">Status:</label>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => setIsActive(!isActive)}
                            className="form-checkbox h-4 w-4 text-indigo-600 cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                            {isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <span className='text-xs'>
                        {isActive ? "(Shown Everywhere)" : "(Hidden Everywhere)"}
                    </span>
                </div>
                <div className='flex justify-between items-center mt-6'>
                    <div onClick={prevStep} className="py-2 px-4 bg-slate-100 text-gray-500 hover:text-black rounded-sm font-semibold border border-slate-300 cursor-pointer transition duration-200">
                        Back
                    </div>

                    {/* Submit Button */}
                    <button
                        type='submit'
                        className="py-2 px-4 bg-[#1BC5BD] text-white rounded-sm font-semibold hover:bg-[#18b7af] transition duration-200"
                    >
                        Update
                    </button>
                </div>
            </form>

        </div>
    )
}

export default QuestionStepTwo
