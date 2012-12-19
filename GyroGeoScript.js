#pragma strict

//Original Arduino Sketch can be found here http://www.starlino.com/imu_guide.html
//surprisingly this actually works in Unity. I'm using the gyroscope to cancel out the gravitational force acting
//on the accelerometer in order to read just external forces acting on the iPhone.
//Unfortunately, I couldn't get this to translate into a meaning full vector to move my camera with.
//Hopefully someone smarter can help with that part.

//I made these variables public for now so that I can display their values in another UI script
var RwEst : Vector3; // A Vector3 is variable type in Unity that holds a tuple of 3 floats ex. (1.2 , 4.21, 6.4) used to store 
var RwAcc : Vector3;		//world coordinate points
var RwGyro : Vector3;
var Awz : Vector2;	//A Vector2 stores a tuple of 2 floats
var firstSample : boolean = true;
var wGyro : int = 15;
var signRzGyro : int; 
var showResult : String;
var showMove : String;
var finalMove : Vector3;
var temp : float;


function Update () {
    
	//assigning the acceleratemeter readings to the Vector3
    RwAcc.x = Input.acceleration.x;
    RwAcc.y = Input.acceleration.y;
    RwAcc.z = Input.acceleration.z;
    
    //mp acceleration vector to unit sphere
    //if (dir.sqrMagnitude > 1)
    RwAcc.Normalize(); //I decided to just normalize the values regardless if it is over 1... not sure if this was a bad move or not
    if(firstSample){
    	RwEst = RwAcc;    	//just like the original code this is to fill in the default starting point before any coords were recorded
    }else{
    	//evaluate RwGyro vector
    	if(System.Math.Abs(RwEst.z) < 0.1){ // Makes sure that if the values are too small we don't change the values
    		RwGyro = RwEst;					// By doing so we give it a smoother read.
    	}else{
    		Awz.x = System.Math.Atan2(RwEst.x,RwEst.z) * 180 / System.Math.PI; //parts of the equation with math beyond my understanding
    																			// there was an additional component to this equation
    		Awz.y = System.Math.Atan2(RwEst.y,RwEst.z) * 180 / System.Math.PI;	// but it was used to track change in angle over time
    																			// Since the Update() function wrapping this is happening over time
    																			// I didn't think it was necessary to account for the change here since it's being done elsewhere... I think...
    		
    		if(System.Math.Cos(Awz.x * System.Math.PI / 180) > 0){ //this part predicts what direction the device is facing. 
    			signRzGyro = 1;										// it follows the cos curve and that is why it's using 1 and -1 to represent direction
	    	}else{
	    		signRzGyro = -1;
	    	}
	    	
	    	//This math is way to hard for me to explain since I don't understand it completely myself
	    	//and I got rid of the for loops. It was easier to deal with storing the values in a Vector3 variable this way
	    	RwGyro.x = System.Math.Sin(Awz.x * System.Math.PI / 180);
	    	RwGyro.x = RwGyro.x / System.Math.Sqrt(1 + System.Math.Pow(System.Math.Cos(Awz.x * System.Math.PI / 180),2) * 
	    												System.Math.Pow(System.Math.Tan(Awz.y * System.Math.PI /180),2));
	    	RwGyro.y = System.Math.Sin(Awz.y * System.Math.PI / 180);  
	    	RwGyro.y = RwGyro.y / System.Math.Sqrt(1 + System.Math.Pow(System.Math.Cos(Awz.y * System.Math.PI / 180),2) * 
												System.Math.Pow(System.Math.Tan(Awz.x * System.Math.PI /180),2));
			RwGyro.z = signRzGyro *System.Math.Sqrt(1 - System.Math.Pow(RwGyro.x,2) - System.Math.Pow(RwGyro.y,2));

    	}
    	
    	RwEst = (RwAcc + wGyro * RwGyro)/(1 + wGyro);
    	
    	RwEst.Normalize();	// this part normalizes it.
    	
    }
    
    //I'm storing the results as strings in order to print them on screen and check if the code is working on not through the UI
    showResult = RwEst.ToString();
    //showMove = (RwAcc - RwEst).ToString();
    finalMove = Vector3(RwEst.x - RwAcc.x, 0, RwEst.z - RwAcc.z);
    //finalMove *= Time.deltaTime;'
	showMove = finalMove.ToString();
    //transform.position +=  finalMove;
    firstSample = false;
}
    
      