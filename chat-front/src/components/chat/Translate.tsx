import React from 'react'
interface Props {

    setLanguage: any;
    language: string;
  }
export default function Translate({language, setLanguage}: Props) {
    const options = ["French", "English", "German", "Arabic", "Norvegian", "Spanish", "Italian", "Russian", "Chinese", "Japanese"]
    const handleChange = (e: any) => {
        setLanguage(e.target.value)
    }
  return (
    <div>
        <select className="select select-bordered bg-white text-black " onChange={(e) => handleChange(e)}>
            <option disabled selected>Choose a language to translate</option>
            {options.map((option) => (
              <option value={option}>{option}</option>
            ))}
      </select>
    </div>
  )
}
