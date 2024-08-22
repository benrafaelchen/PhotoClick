import React, { useState } from "react";
import "../assets/styles/FAQ.css";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  const faqData = [
    {
      question: "How do I place an order for photography services?",
      answer:
        "Placing an order with PhotoClick is easy! Simply visit our website and navigate to the 'Create New Order' section. Follow the prompts to provide details about your event, select your desired package, and complete the booking process.",
    },
    {
      question: "What types of events do you cover?",
      answer:
        "PhotoClick specializes in capturing a wide range of events, including weddings, birthday parties, corporate events, family gatherings, and more. Whatever the occasion, our experienced photographers and videographers are ready to preserve your special moments.",
    },
    {
      question: "Can I customize my photography package?",
      answer:
        "Yes, we offer customizable photography packages to suit your specific needs and preferences. Whether you need additional hours of coverage, extra prints, or special editing services, we can tailor a package that meets your requirements.",
    },
    {
      question:
        "How long does it take to receive my photos and videos after the event?",
      answer:
        "Our turnaround time for delivering photos and videos varies depending on the scope of the project and our current workload. However, we strive to provide a quick and efficient service, and you can expect to receive your edited photos and videos within [insert timeframe].",
    },
    {
      question:
        "What safety measures do you have in place during the COVID-19 pandemic?",
      answer:
        "At PhotoClick, the health and safety of our clients and staff are our top priority. We strictly adhere to all local health guidelines and regulations to ensure a safe and enjoyable experience for everyone involved. Our photographers and videographers wear masks, practice social distancing, and sanitize equipment before and after each event to minimize the risk of exposure to COVID-19.",
    },
    {
      question: "Do you offer videography services in addition to photography?",
      answer:
        "Yes, we offer professional videography services alongside our photography packages. Our skilled videographers are equipped to capture your event in stunning high-definition video, preserving every moment and emotion for you to cherish for years to come. Whether you're looking for a highlight reel, full event coverage, or cinematic storytelling, we have the expertise to bring your vision to life.",
    },
  ];

  return (
    <ul className="faq-list">
      {faqData.map((item, index) => (
        <li key={index}>
          <h4
            onClick={() => toggleFAQ(index)}
            className={activeIndex === index ? "active" : ""}
          >
            {item.question}
          </h4>
          <p className={activeIndex === index ? "active" : ""}>{item.answer}</p>
        </li>
      ))}
    </ul>
  );
};

export default FAQ;
