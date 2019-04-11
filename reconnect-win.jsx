#target aftereffects
(function()
{
	var RETURN_CODE_SUCCESS = 0;
	var RETURN_CODE_FAIL = 1;

	var items = app.project.selection;
	var searchD = Folder.selectDialog
	(
		"Enter Directory To Search"
	);
	var searchDS = searchD.fsName;
	var tempDir = Folder.temp.toString();
	var foundF = {};
	var itemnameS = "";
	var i = 0;

	function cString( s, a )
	// A string function like printf in C
	// variables are inserted using the `%` delimiter
	{
		var i = 0;
		var newS = s;
		while ( i < a.length )
		{
			newS = newS.replace( '%c', a[i] );
			i += 1;
		}
		return newS;
	}
	function awaitFileThen( t, f , func )
	// waits `t` number of seconds
	// for file `f` to exist
	// then performs function `func` on file `f`
	// and returns that result
	{
		// Assume failure by default
		var result = RETURN_CODE_FAIL;
		var i = 0;

		if ( !t )
		// default timeout is 5 sec
		{
			t = 5;
		}
		
		while ( i < t )
		{
			if ( f.exists && !func )
			{
				result = RETURN_CODE_SUCCESS;
				break;
			}
			if ( f.exists && func )
			{
				result = func( f );
				break;
			}
			i += 1;
			$.sleep(1000);
		}
		return result;
	}
	function sysCmd( cmd, cmdF )
	{
		var f = new File( cmdF );
		f.open( "w" );
		f.write( cmd );
		f.writeln( "\rexit" );
		f.close();

		system.callSystem
		(
			'chmod 755 "' + cmdF + '"'
		);

		f.execute();

		return RETURN_CODE_SUCCESS;
	}
	function respondTo( f )
	{

		f.open("r");
		f.execute();
		f.close();

		return RETURN_CODE_SUCCESS;
	}

	i = 0;
	while ( i < items.length )
	{
		itemnameS = items[i].mainSource.file.fsName;
		itemnameS = itemnameS.substring
		(
			itemnameS.lastIndexOf("/") + 1,
			itemnameS.length
		);

		// the only way to get the results of `find`
		// into AE is to write it to a file
		sysCmd
		(
			cString
			(
				'cd "%c";\r' +
				'echo "this is the top of the file" > %c\\found.txt;\r' +
				'timeout /nobreak /t 2;\r' +
				'dir "%c" >> "%c\\found.txt" \\\;',

				[searchDS, tempDir, itemNameS, tempDir]
			),

			tempDir + '/search.sh'
		);
		foundF = new File
		(
			Folder.temp.toString() +
			'/found.txt'
		);
		awaitFileThen
		(
			5,
			foundF,
			function()
			{
				respondTo( foundF );
			}
		);
		i += 1;
	}
}());
